import log from 'electron-log/main';
import { sync } from 'fast-glob';
import { createServer } from 'http';
import { inject, injectable } from 'inversify';
import { posix, sep } from 'path';
import { uid } from 'quasar';
import { WebSocketServer } from 'ws';

import { PromptExtractor } from 'main/components/PromptExtractor';
import { RawInputs } from 'main/components/PromptExtractor/types';
import {
  getFunctionPrefix,
  getFunctionSuffix,
} from 'main/components/PromptExtractor/utils';
import { PromptProcessor } from 'main/components/PromptProcessor';
import { DataStoreService } from 'main/services/DataStoreService';
import { StatisticsService } from 'main/services/StatisticsService';
import { MAX_REFERENCES_REQUEST_TIME } from 'main/services/WebsocketService/constants';
import {
  ClientInfo,
  HttpMethod,
  HttpRouter,
} from 'main/services/WebsocketService/types';
import { findSvnPath } from 'main/services/WebsocketService/utils';
import { WindowService } from 'main/services/WindowService';
import { DataProjectType } from 'main/stores/data/types';
import { TextDocument } from 'main/types/TextDocument';
import { Position } from 'main/types/vscode/position';
import { Range } from 'main/types/vscode/range';
import { deleteComments } from 'main/utils/common';
import {
  CompletionErrorCause,
  getClientVersion,
  getProjectData,
} from 'main/utils/completion';
import { ServiceType } from 'shared/types/service';
import { WebsocketServiceTrait } from 'shared/types/service/WebsocketServiceTrait';
import { WindowType } from 'shared/types/WindowType';
import {
  CompletionGenerateServerMessage,
  HandShakeClientMessage,
  ReviewRequestServerMessage,
  StandardResult,
  WsAction,
  WsMessageMapping,
} from 'shared/types/WsMessage';
import { MainWindowPageType } from 'shared/types/MainWindowPageType';
import { Selection } from 'shared/types/Selection';
import { Reference } from 'shared/types/review';

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
  // private referencesResolveHandle?: (value: Reference[]) => void;
  private referencesResolveHandleMap = new Map<
    string,
    (value: Reference[]) => void
  >();

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

  async getCurrentFile(): Promise<string | undefined> {
    return this.getClientInfo(this._lastActivePid)?.currentFile;
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
          .catch((e) => log.warn('WsAction.CompletionEdit', e));
      } catch (e) {
        log.warn('WsAction.CompletionEdit', e);
        this._statisticsReporterService.completionAbort(actionId);
      }
    });
    this._registerWsAction(
      WsAction.CompletionGenerate,
      async ({ data }, pid) => {
        const { caret, times } = data;
        const actionId = this._statisticsReporterService.completionBegin(
          caret,
          times.start,
          times.symbol,
          times.end,
        );
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
              actionId,
              new RawInputs(data, project),
            );
          this._statisticsReporterService.completionUpdatePromptElements(
            actionId,
            promptElements,
          );

          const completions = await this._promptProcessor.process(
            actionId,
            promptElements,
            projectId,
          );
          if (completions) {
            this._statisticsReporterService.completionGenerated(
              actionId,
              completions,
            );

            return new CompletionGenerateServerMessage({
              actionId,
              completions,
              result: 'success',
            });
          }

          this._statisticsReporterService.completionAbort(actionId);
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
      const mainWindow = this._windowService.getWindow(WindowType.Main);
      mainWindow.show();
      const mainWindowPage = mainWindow.getPage(MainWindowPageType.Commit);
      mainWindowPage.setCurrentFile(currentFile);
      mainWindowPage.active().catch();
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
    this._registerWsAction(WsAction.EditorSelection, ({ data }) => {
      if (data.dimensions.height === 0 || data.content.length === 0) {
        this._windowService.getWindow(WindowType.SelectionTips).hide();
        return;
      }

      const project = this.getClientInfo(this._lastActivePid)?.currentProject;
      if (!project) {
        this._windowService.getWindow(WindowType.SelectionTips).hide();
        return;
      }
      const selectionTipsWindow = this._windowService.getWindow(
        WindowType.SelectionTips,
      );
      const selection: Selection = {
        block: data.block,
        file: data.path,
        content: data.content,
        range: new Range(
          data.begin.line,
          data.begin.character,
          data.end.line,
          data.end.character,
        ),
        language: 'c',
      };
      const { id: projectId } = getProjectData(project);
      selectionTipsWindow.trigger(
        {
          x: data.dimensions.x,
          y: data.dimensions.y - 30,
        },
        selection,
        {
          projectId: projectId,
          version: getClientVersion(this._lastActivePid),
        },
      );
    });
    this._registerWsAction(
      WsAction.EditorSwitchFile,
      async ({ data: filePath }, pid) => {
        const clientInfo = this._clientInfoMap.get(pid);
        if (clientInfo) {
          clientInfo.currentFile = filePath;
          const svnPath = findSvnPath(filePath);
          if (svnPath) {
            try {
              await this._dataStoreService.setProjectSvn(
                clientInfo.currentProject,
                svnPath,
              );
            } catch (e) {
              log.error('EditorSwitchSvn', e);
            }
          }
        }
      },
    );
    this._registerWsAction(
      WsAction.EditorSwitchProject,
      ({ data: project }, pid) => {
        const clientInfo = this._clientInfoMap.get(pid);
        if (clientInfo) {
          clientInfo.currentProject = project;
        }
      },
    );
    this._registerWsAction(WsAction.ReviewRequest, ({ data }) => {
      log.info('ReviewRequest Response', data);
      const { id } = data;
      const referencesResolveHandle = this.referencesResolveHandleMap.get(id);
      if (referencesResolveHandle) {
        referencesResolveHandle(
          data.references.map((reference) => ({
            ...reference,
            content: deleteComments(reference.content),
          })) || [],
        );
        this.referencesResolveHandleMap.delete(id);
      }
    });
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

  async getCodeReviewReferences(selection: Selection) {
    const successPromise = new Promise<Reference[]>((resolve) => {
      const id = uid();
      this.send(
        JSON.stringify(
          new ReviewRequestServerMessage({
            id,
            result: 'success',
            content: selection.block || selection.content,
            path: selection.file,
            beginLine: selection.range.start.line,
            endLine: selection.range.end.line,
          }),
        ),
      );
      // log.info('getCodeReviewReferences', selection);
      // this.referencesResolveHandle = resolve;
      this.referencesResolveHandleMap.set(id, resolve);
    });

    const timeoutPromise = new Promise<Reference[]>((resolve) => {
      setTimeout(() => {
        resolve([]);
      }, MAX_REFERENCES_REQUEST_TIME);
    });

    return Promise.race([successPromise, timeoutPromise]);
  }
}
