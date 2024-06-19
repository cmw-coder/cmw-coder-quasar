import log from 'electron-log/main';
import { sync } from 'fast-glob';
import { existsSync } from 'fs';
import { lstat, readFile } from 'fs/promises';
import { createServer } from 'http';
import { inject, injectable } from 'inversify';
import { posix, sep } from 'path';
import { type WebSocket, WebSocketServer } from 'ws';

import { PromptExtractor } from 'main/components/PromptExtractor';
import { RawInputs } from 'main/components/PromptExtractor/types';
import { PromptProcessor } from 'main/components/PromptProcessor';
import { DataStoreService } from 'main/services/DataStoreService';
import { StatisticsService } from 'main/services/StatisticsService';
import { HttpMethod, HttpRouter } from 'main/services/WebsocketService/types';
import { WindowService } from 'main/services/WindowService';
import { DataProjectType } from 'main/stores/data/types';
import { TextDocument } from 'main/types/TextDocument';
import { Position } from 'main/types/vscode/position';
import {
  CompletionErrorCause,
  getClientVersion,
  getProjectData,
} from 'main/utils/completion';
import { timer } from 'main/utils/timer';
import { ServiceType } from 'shared/types/service';
import { WebsocketServiceTrait } from 'shared/types/service/WebsocketServiceTrait';
import { WindowType } from 'shared/types/WindowType';
import {
  CompletionGenerateServerMessage,
  HandShakeClientMessage,
  StandardResult,
  WsAction,
  WsMessageMapping,
} from 'shared/types/WsMessage';
import {
  getFunctionPrefix,
  getFunctionSuffix,
} from 'main/components/PromptExtractor/utils';
import { decode } from 'iconv-lite';

interface ClientInfo {
  client: WebSocket;
  currentProject: string;
  version: string;
}

@injectable()
export class WebsocketService implements WebsocketServiceTrait {
  private _clientInfoMap = new Map<number, ClientInfo>();
  private _handlers = new Map<
    WsAction,
    (
      message: WsMessageMapping[keyof WsMessageMapping]['client'],
      pid: number,
    ) => WsMessageMapping[keyof WsMessageMapping]['server']
  >();
  private _httpRouter = new HttpRouter();
  private _lastActivePid = 0;
  private _promptProcessor = new PromptProcessor();
  private _promptExtractor = new PromptExtractor();
  private _webSocketServer?: WebSocketServer;

  constructor(
    @inject(ServiceType.DATA_STORE)
    private _dataStoreService: DataStoreService,
    @inject(ServiceType.STATISTICS)
    private _statisticsReporterService: StatisticsService,
    @inject(ServiceType.WINDOW)
    private _windowService: WindowService,
  ) {
    this._httpRouter.addRoute('/', HttpMethod.GET, (_, res) => {
      res.sendJson({
        message: 'Welcome to the Comware Coder backend!',
        entries: [
          {
            route: '/',
            method: 'GET',
            description: 'This welcome page',
          },
          {
            route: '/dev/similar-snippets',
            method: 'POST',
            description: 'Test similar snippets',
          },
        ],
      });
    });
    this._httpRouter.addRoute(
      '/dev/similar-snippets',
      HttpMethod.POST,
      async (req, res) => {
        const body = await req.body<{
          character: number;
          folder: string;
          line: number;
          path: string;
          prefix: string;
          suffix: string;
        }>();
        const { character, folder, line, path, prefix, suffix } = body;
        this._promptExtractor.enableSimilarSnippet();
        const similarSnippets = await this.getSimilarSnippets(
          character,
          folder,
          line,
          path,
          prefix,
          suffix,
        );
        res.sendJson({ message: 'Success', similarSnippets });
      },
    );
  }

  async checkFolderExist(path: string): Promise<boolean> {
    return existsSync(path) && (await lstat(path)).isDirectory();
  }

  async getFileContent(path: string): Promise<string | undefined> {
    try {
      return decode(await readFile(path), 'gbk');
    } catch (e) {
      log.error('getFileContent', e);
      return undefined;
    }
  }

  async getProjectData() {
    const project = this.getClientInfo(this._lastActivePid)?.currentProject;
    if (!project) {
      return undefined;
    }
    const appData = this._dataStoreService.getAppdata();
    const projectData: DataProjectType | undefined = appData.project[project];
    if (!projectData || !projectData.id) {
      return undefined;
    }
    return projectData;
  }

  async getSimilarSnippets(
    character: number,
    folder: string,
    line: number,
    path: string,
    prefix: string,
    suffix: string,
  ) {
    path = path.split(sep).join(posix.sep);
    const document = new TextDocument(path);
    const position = new Position(line, character);
    const recentFiles = sync(
      ['**/*.c', '**/*.cc', '**/*.cpp', '**/*.h', '**/*.hpp'],
      {
        absolute: true,
        cwd: folder,
      },
    )
      .map((fileName) => fileName.split(sep).join(posix.sep))
      .filter((fileName) => fileName !== document.fileName);
    this._promptExtractor.enableSimilarSnippet();
    const similarSnippets = this._promptExtractor.getSimilarSnippets(
      document,
      position,
      getFunctionPrefix(prefix) ?? prefix,
      getFunctionSuffix(suffix) ?? suffix,
      recentFiles,
    );
    log.debug('WebsocketService.getSimilarSnippets', {
      similarSnippets,
    });
    return similarSnippets;
  }

  send(message: string, pid?: number) {
    const client = this.getClientInfo(pid ?? this._lastActivePid)?.client;
    if (client) {
      client.send(message);
    }
  }

  getClientInfo(pid?: number) {
    return this._clientInfoMap.get(pid ?? this._lastActivePid);
  }

  startServer() {
    const httpServer = createServer(async (req, res) => {
      this._httpRouter
        .handleRequest(req, res)
        .catch((e) =>
          log.error(
            'WebsocketService.httpRouter.handleRequest',
            (<Error>e).message,
          ),
        );
    });
    this._webSocketServer = new WebSocketServer({
      server: httpServer,
    });
    this._webSocketServer.on('connection', (client) => {
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
    httpServer.listen(3000, '127.0.0.1');
  }

  registerActions() {
    this._registerWsAction(WsAction.CompletionAccept, async ({ data }, pid) => {
      const { actionId, index } = data;
      this._windowService.getWindow(WindowType.Completions).completionClear();
      try {
        this._statisticsReporterService
          .completionAccept(actionId, index, getClientVersion(pid))
          .catch();
      } catch {
        this._statisticsReporterService.completionAbort(actionId);
      }
    });
    this._registerWsAction(WsAction.CompletionCache, ({ data: isDelete }) => {
      this._windowService
        .getWindow(WindowType.Completions)
        .completionUpdate(isDelete);
    });
    this._registerWsAction(WsAction.CompletionCancel, ({ data }, pid) => {
      this._windowService.getWindow(WindowType.Completions).completionClear();
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
    this._registerWsAction(WsAction.CompletionEdit, ({ data }, pid) => {
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
    this._registerWsAction(
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

          log.debug('WsAction.CompletionGenerate', data);

          const promptElements =
            await this._promptExtractor.getPromptComponents(
              new RawInputs(data, project),
            );
          this._statisticsReporterService.completionUpdatePromptElements(
            actionId,
            promptElements,
          );

          const completions = await this._promptProcessor.process(
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
              this._windowService.getWindow(WindowType.Login).show();
              break;
            }
            case CompletionErrorCause.clientInfo: {
              result = 'failure';
              break;
            }
            case CompletionErrorCause.projectData: {
              result = 'failure';
              this._windowService.getWindow(WindowType.ProjectId).show();
              this._windowService
                .getWindow(WindowType.ProjectId)
                .setProject(project);
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
    this._registerWsAction(WsAction.CompletionSelect, ({ data }, pid) => {
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
          this._windowService
            .getWindow(WindowType.Completions)
            .completionSelect(
              candidate,
              {
                index,
                total:
                  this._statisticsReporterService.completionCount(actionId),
              },
              height,
              { x, y },
            )
            .catch((e) => log.warn('WsAction.CompletionSelect', e));
        }
      } catch {
        this._statisticsReporterService.completionAbort(actionId);
      }
    });
    this._registerWsAction(WsAction.EditorCommit, ({ data: currentFile }) => {
      this._windowService
        .getWindow(WindowType.Commit)
        .setCurrentFile(currentFile);
      this._windowService.getWindow(WindowType.Commit).show();
    });
    this._registerWsAction(WsAction.EditorFocusState, ({ data: isFocused }) => {
      if (!isFocused) {
        this._windowService.getWindow(WindowType.Completions).hide();
      }
    });
    this._registerWsAction(WsAction.EditorPaste, ({ data }, pid) => {
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
              this._windowService.getWindow(WindowType.ProjectId).show();
              this._windowService
                .getWindow(WindowType.ProjectId)
                .setProject(project);
              break;
            }
            default: {
              break;
            }
          }
        }
      }
    });
    this._registerWsAction(
      WsAction.EditorSwitchProject,
      ({ data: project }, pid) => {
        const clientInfo = this._clientInfoMap.get(pid);
        if (clientInfo) {
          clientInfo.currentProject = project;
        }
      },
    );
    this._registerWsAction(
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

  private _registerWsAction<T extends keyof WsMessageMapping>(
    wsAction: T,
    callback: (
      message: WsMessageMapping[T]['client'],
      pid: number,
    ) => WsMessageMapping[T]['server'],
  ) {
    this._handlers.set(wsAction, callback);
  }
}
