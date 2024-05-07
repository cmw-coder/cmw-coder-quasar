import log from 'electron-log/main';
import { inject, injectable } from 'inversify';
import { Server, type WebSocket } from 'ws';

import { PromptExtractor } from 'main/components/PromptExtractor';
import { RawInputs } from 'main/components/PromptExtractor/types';
import { PromptProcessor } from 'main/components/PromptProcessor';
import {
  CompletionErrorCause,
  getClientVersion,
  getProjectData,
} from 'main/utils/completion';
import { timer } from 'main/utils/timer';
import { DataStoreService } from 'service/entities/DataStoreService';
import type { WindowService } from 'service/entities/WindowService';
import type { StatisticsService } from 'service/entities/StatisticsService';
import { ServiceType } from 'shared/services';
import { WebsocketServiceBase } from 'shared/services/types/WebsocketServiceBase';
import {
  CompletionGenerateServerMessage,
  HandShakeClientMessage,
  StandardResult,
  WsAction,
  WsMessageMapping,
} from 'shared/types/WsMessage';

interface ClientInfo {
  client: WebSocket;
  currentProject: string;
  version: string;
}

@injectable()
export class WebsocketService implements WebsocketServiceBase {
  private _clientInfoMap = new Map<number, ClientInfo>();
  private _lastActivePid = 0;
  private _handlers = new Map<
    WsAction,
    (
      message: WsMessageMapping[keyof WsMessageMapping]['client'],
      pid: number,
    ) => WsMessageMapping[keyof WsMessageMapping]['server']
  >();
  private _server?: Server;

  private promptProcessor = new PromptProcessor();
  private promptExtractor = new PromptExtractor();

  constructor(
    @inject(ServiceType.DATA_STORE)
    private _dataStoreService: DataStoreService,
    @inject(ServiceType.STATISTICS)
    private _statisticsReporterService: StatisticsService,
    @inject(ServiceType.WINDOW)
    private _windowService: WindowService,
  ) {}

  getClientInfo(pid?: number) {
    return this._clientInfoMap.get(pid ?? this._lastActivePid);
  }

  registerWsAction<T extends keyof WsMessageMapping>(
    wsAction: T,
    callback: (
      message: WsMessageMapping[T]['client'],
      pid: number,
    ) => WsMessageMapping[T]['server'],
  ) {
    this._handlers.set(wsAction, callback);
  }

  send(message: string, pid?: number) {
    const client = this.getClientInfo(pid ?? this._lastActivePid)?.client;
    if (client) {
      client.send(message);
    }
  }

  setCurrentProject(pid: number, currentProject: string) {
    const clientInfo = this._clientInfoMap.get(pid);
    if (clientInfo) {
      clientInfo.currentProject = currentProject;
    }
  }

  startServer() {
    this._server = new Server({
      host: '127.0.0.1',
      port: 3000,
    });
    this._server.on('connection', (client) => {
      let pid: number;

      client.on('message', async (message: string) => {
        const clientMessage = JSON.parse(message);
        if (clientMessage.action === WsAction.HandShake) {
          const { data } = <HandShakeClientMessage>clientMessage;
          pid = data.pid;
          this._clientInfoMap.set(pid, {
            client,
            currentProject: data.currentProject,
            version: data.version,
          });
          this._lastActivePid = pid;
          log.info(`Websocket client verified, pid: ${pid}`);
        } else {
          if (!pid) {
            log.info('Websocket client not verified');
            client.close();
            return;
          }
          const handler = this._handlers.get(clientMessage.action);
          if (handler) {
            this._lastActivePid = pid;
            const result = await handler(clientMessage, pid);
            if (result) {
              client.send(JSON.stringify(result));
            }
          }
        }
      });

      client.on('close', () => {
        log.info(`Client (${pid}) disconnected`);
      });
    });
  }

  registerActions() {
    this.registerWsAction(WsAction.CompletionAccept, async ({ data }, pid) => {
      const { actionId, index } = data;
      this._windowService.completionsWindow.completionClear();
      try {
        this._statisticsReporterService
          .completionAccept(actionId, index, getClientVersion(pid))
          .catch();
      } catch {
        this._statisticsReporterService.completionAbort(actionId);
      }
    });
    this.registerWsAction(WsAction.CompletionCache, ({ data: isDelete }) => {
      this._windowService.completionsWindow.completionUpdate(isDelete);
    });
    this.registerWsAction(WsAction.CompletionCancel, ({ data }, pid) => {
      this._windowService.completionsWindow.completionClear();
      const { actionId, explicit } = data;
      if (explicit) {
        try {
          this._statisticsReporterService
            .completionCancel(actionId, getClientVersion(pid))
            .catch();
          return;
        } catch {}
      }
      this._statisticsReporterService.completionAbort(actionId);
    });
    this.registerWsAction(WsAction.CompletionEdit, ({ data }, pid) => {
      const { actionId, count, editedContent, ratio } = data;
      try {
        this._statisticsReporterService
          .completionEdit(
            actionId,
            count,
            editedContent,
            ratio,
            getClientVersion(pid),
          )
          .catch();
      } catch {
        this._statisticsReporterService.completionAbort(actionId);
      }
    });
    this.registerWsAction(
      WsAction.CompletionGenerate,
      async ({ data }, pid) => {
        const { caret } = data;
        const actionId = this._statisticsReporterService.completionBegin(caret);
        const project = this.getClientInfo(pid)?.currentProject;
        if (!project || !project.length) {
          return new CompletionGenerateServerMessage({
            result: 'failure',
            message: 'Invalid project path',
          });
        }

        try {
          const { id: projectId } = getProjectData(project);
          this._statisticsReporterService.completionUpdateProjectId(
            actionId,
            projectId,
          );

          const promptElements = await this.promptExtractor.getPromptComponents(
            new RawInputs(data, project),
          );
          this._statisticsReporterService.completionUpdatePromptElements(
            actionId,
            promptElements,
          );

          const completions = await this.promptProcessor.process(
            promptElements,
            projectId,
          );
          if (completions) {
            this._statisticsReporterService.completionGenerated(
              actionId,
              completions,
            );

            log.log(timer.parse('CompletionGenerate'));
            timer.remove('CompletionGenerate');
            return new CompletionGenerateServerMessage({
              actionId,
              completions,
              result: 'success',
            });
          }

          this._statisticsReporterService.completionAbort(actionId);
          timer.remove('CompletionGenerate');
        } catch (e) {
          const error = <Error>e;
          let result: StandardResult['result'] = 'error';
          switch (error.cause) {
            case CompletionErrorCause.accessToken: {
              result = 'failure';
              this._windowService.loginWindow.activate();
              break;
            }
            case CompletionErrorCause.clientInfo: {
              result = 'failure';
              break;
            }
            case CompletionErrorCause.projectData: {
              result = 'failure';
              this._windowService.projectIdWindow.activate();
              this._windowService.projectIdWindow.setProject(project);
              break;
            }
          }

          this._statisticsReporterService.completionAbort(actionId);
          timer.remove('CompletionGenerate');
          return new CompletionGenerateServerMessage({
            result,
            message: error.message,
          });
        }
      },
    );
    this.registerWsAction(WsAction.CompletionSelect, ({ data }, pid) => {
      const {
        actionId,
        index,
        dimensions: { height, x, y },
      } = data;
      try {
        const candidate = this._statisticsReporterService.completionSelected(
          actionId,
          index,
          getClientVersion(pid),
        );
        if (candidate) {
          this._windowService.completionsWindow.completionSelect(
            candidate,
            {
              index,
              total: this._statisticsReporterService.completionCount(actionId),
            },
            height,
            { x, y },
          );
        }
      } catch {
        this._statisticsReporterService.completionAbort(actionId);
      }
    });
    this.registerWsAction(WsAction.EditorCommit, ({ data: currentFile }) => {
      this._windowService.commitWindow.activate();
      this._windowService.commitWindow.setCurrentFile(currentFile);
    });
    this.registerWsAction(WsAction.EditorFocusState, ({ data: isFocused }) => {
      if (!isFocused) {
        this._windowService.completionsWindow.hide();
      }
    });
    this.registerWsAction(WsAction.EditorPaste, ({ data }, pid) => {
      const { count } = data;
      const project = this.getClientInfo(pid)?.currentProject;
      if (project && project.length) {
        try {
          const { id: projectId } = getProjectData(project);
          this._statisticsReporterService
            .copiedLines(count, projectId, getClientVersion(pid))
            .catch();
        } catch (e) {
          const error = <Error>e;
          switch (error.cause) {
            case CompletionErrorCause.projectData: {
              console.log('CompletionErrorCause.projectData', error);
              this._windowService.projectIdWindow.activate();
              this._windowService.projectIdWindow.setProject(project);
              break;
            }
            default: {
              break;
            }
          }
        }
      }
    });
    this.registerWsAction(
      WsAction.EditorSwitchProject,
      ({ data: project }, pid) => {
        this.setCurrentProject(pid, project);
      },
    );
    this.registerWsAction(
      WsAction.EditorSwitchSvn,
      async ({ data: svnPath }, pid) => {
        const project = this.getClientInfo(pid)?.currentProject;
        if (project && project.length) {
          try {
            await this._dataStoreService.setProjectSvn(project, svnPath);
          } catch (e) {
            log.error('EditorSwitchSvn', e);
          }
        }
      },
    );
  }
}
