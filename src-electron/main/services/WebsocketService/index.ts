import { Reference, SelectionData } from 'cmw-coder-subprocess';
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
  calculateFunctionPrefix,
  calculateFunctionSuffix,
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
import {
  CompletionErrorCause,
  getClientVersion,
  getProjectData,
} from 'main/utils/completion';
import completionLog from 'main/components/Loggers/completionLog';
import reviewLog from 'main/components/Loggers/reviewLog';
import { NEW_LINE_REGEX } from 'shared/constants/common';
import { MODULE_PATH } from 'main/components/PromptExtractor/constants';
import { getService } from 'main/services';
import { ConfigService } from 'main/services/ConfigService';
import statisticsLog from 'main/components/Loggers/statisticsLog';
import { UpdateStatusActionMessage } from 'shared/types/ActionMessage';
import { CaretPosition, GenerateType, Selection } from 'shared/types/common';
import { MainWindowPageType } from 'shared/types/MainWindowPageType';
import { ServiceType } from 'shared/types/service';
import { WebsocketServiceTrait } from 'shared/types/service/WebsocketServiceTrait';
import { Status } from 'shared/types/service/WindowServiceTrait/StatusWindowType';
import { WindowType } from 'shared/types/WindowType';
import {
  CompletionGenerateServerMessage,
  HandShakeClientMessage,
  ReviewRequestServerMessage,
  SettingSyncServerMessage,
  StandardResult,
  WsAction,
  WsMessageMapping,
} from 'shared/types/WsMessage';

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
    @inject(ServiceType.CONFIG)
    private _configService: ConfigService,
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
    const position = new CaretPosition(line, character);
    const recentFiles = sync(
      ['**/*.c', '**/*.cc', '**/*.cpp', '**/*.h', '**/*.hpp'],
      {
        absolute: true,
        cwd: folder,
      },
    )
      .map((fileName) => fileName.split(sep).join(posix.sep))
      .filter((fileName) => fileName !== document.fileName);
    const similarSnippets = this._promptExtractor.getSimilarSnippets(
      document,
      position,
      calculateFunctionPrefix(prefix),
      calculateFunctionSuffix(suffix),
      recentFiles,
    );
    completionLog.debug('WebsocketService.getSimilarSnippets', {
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
          client.send(
            JSON.stringify(
              new SettingSyncServerMessage({
                result: 'success',
                completionConfig:
                  await this._configService.getConfig('completion'),
              }),
            ),
          );
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

      client.on('close', (code) => {
        if (this._lastActivePid === pid) {
          this._lastActivePid = -1;
          this._windowService.hideWindow(WindowType.Completions).catch();
          this._windowService.hideWindow(WindowType.Status).catch();
        }

        if (code !== 1000) {
          this._windowService.trayIcon.notify({
            title: 'Source Insight 异常退出',
            content: `进程ID：${pid}, 错误码：${code}`,
          });
        }
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
          .catch((e) => completionLog.warn('WsAction.CompletionEdit', e));
      } catch (e) {
        completionLog.warn('WsAction.CompletionEdit', e);
        this._statisticsReporterService.completionAbort(actionId);
      }
    });
    this._registerWsAction(
      WsAction.CompletionGenerate,
      async ({ data }, pid) => {
        const statusWindow = this._windowService.getWindow(WindowType.Status);
        const { caret, times } = data;
        const actionId = this._statisticsReporterService.completionBegin(
          caret,
          times.start,
          times.symbol,
          times.end,
        );
        const project = this.getClientInfo(pid)?.currentProject;
        if (!project || !project.length) {
          statusWindow.sendMessageToRenderer(
            new UpdateStatusActionMessage({
              status: Status.ERROR,
              detail: 'Invalid project path',
            }),
          );
          return new CompletionGenerateServerMessage({
            result: 'failure',
            message: 'Invalid project path',
          });
        }

        try {
          const { id: projectId } = getProjectData(project);
          this._statisticsReporterService.fileRecorderManager.addFileRecorder(
            data.path,
            projectId,
          );
          this._statisticsReporterService.completionUpdateProjectId(
            actionId,
            projectId,
          );

          completionLog.debug('WsAction.CompletionGenerate', {
            ...data,
            prefix: 'Removed',
            suffix: 'Removed',
          });
          statusWindow.sendMessageToRenderer(
            new UpdateStatusActionMessage({
              status: Status.GENERATING,
              detail: '触发生成...',
            }),
          );
          const rawInputs = new RawInputs(data, project);
          const promptElements =
            await this._promptExtractor.getPromptComponents(
              actionId,
              rawInputs,
            );
          this._statisticsReporterService.completionUpdateEndGetPromptComponentsTime(
            actionId,
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
            statusWindow.sendMessageToRenderer(
              new UpdateStatusActionMessage({
                status: Status.READY,
                detail: '就绪',
              }),
            );

            return new CompletionGenerateServerMessage({
              actionId,
              type: rawInputs.elements.generateType,
              completions,
              selection: rawInputs.selection,
              result: 'success',
            });
          }

          this._statisticsReporterService
            .completionNoResults(actionId)
            .catch((e) => completionLog.error(e));
          return new CompletionGenerateServerMessage({
            message: 'No completion',
            result: 'failure',
          });
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
            default: {
              completionLog.error('WsAction.CompletionGenerate.error', error);
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
        type,
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
          let calculatedY = y;
          if (type === GenerateType.PasteReplace) {
            calculatedY =
              y - height * candidate.split(NEW_LINE_REGEX).length - 40;
          }
          this._windowService
            .getWindow(WindowType.Completions)
            .completionSelect(
              type,
              candidate,
              {
                index,
                total:
                  this._statisticsReporterService.completionCount(actionId),
              },
              height,
              { x, y: calculatedY },
            )
            .catch((e) => completionLog.warn('WsAction.CompletionSelect', e));
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
    this._registerWsAction(WsAction.EditorPaste, async ({ data }, pid) => {
      const clientInfo = this._clientInfoMap.get(pid);
      statisticsLog.log('粘贴操作记录', clientInfo?.currentFile);
      if (
        clientInfo &&
        clientInfo.currentFile?.length &&
        clientInfo.currentProject?.length
      ) {
        try {
          const { caret, context, recentFiles } = data;
          const { id: projectId } = getProjectData(clientInfo.currentProject);
          this._statisticsReporterService
            .copiedLines(
              context.infix.split(NEW_LINE_REGEX).length,
              projectId,
              getClientVersion(pid),
            )
            .catch();
          if (clientInfo.currentFile) {
            this._statisticsReporterService.fileRecorderManager.addFileRecorder(
              clientInfo.currentFile,
              projectId,
            );
          }
          const document = new TextDocument(clientInfo.currentFile);
          let repo = '';
          for (const [key, value] of Object.entries(MODULE_PATH)) {
            if (document.fileName.includes(value)) {
              repo = key;
              break;
            }
          }
          this._statisticsReporterService
            .copiedContents({
              content: context.infix,
              context: {
                prefix: context.prefix,
                suffix: context.suffix,
              },
              path: document.fileName,
              position: caret,
              projectId,
              recentFiles,
              repo,
              svn: (
                this._dataStoreService.getAppdata().project[projectId]?.svn ??
                []
              ).map(({ directory }) => directory),
              userId: (await getService(ServiceType.CONFIG).getConfigs())
                .username,
            })
            .catch();
        } catch (e) {
          const error = <Error>e;
          switch (error.cause) {
            case CompletionErrorCause.projectData: {
              console.log('CompletionErrorCause.projectData', error);
              this._windowService.getWindow(WindowType.ProjectId).show();
              this._windowService
                .getWindow(WindowType.ProjectId)
                .setProject(clientInfo.currentProject);
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
      const selectionData: SelectionData = {
        block: data.block,
        file: data.path,
        content: data.content,
        range: new Selection(
          new CaretPosition(data.begin.line, data.begin.character),
          new CaretPosition(data.end.line, data.end.character),
        ),
        language: 'c',
      };
      const { id: projectId } = getProjectData(project);
      selectionTipsWindow
        .trigger(
          {
            x: data.dimensions.x,
            y: data.dimensions.y - 30,
          },
          selectionData,
          {
            projectId: projectId,
            version: getClientVersion(this._lastActivePid),
          },
        )
        .catch((e) => completionLog.error('EditorSelection', e));
    });
    this._registerWsAction(
      WsAction.EditorState,
      ({ data: { dimensions, isFocused } }) => {
        const completionsWindow = this._windowService.getWindow(
          WindowType.Completions,
        );
        const statusWindow = this._windowService.getWindow(WindowType.Status);
        if (dimensions) {
          statusWindow.move(dimensions);
        }
        if (isFocused !== undefined) {
          if (isFocused) {
            statusWindow.show(undefined, false);
          } else {
            completionsWindow.hide();
            statusWindow.hide();
          }
        }
      },
    );
    this._registerWsAction(
      WsAction.EditorSwitchFile,
      async ({ data: filePath }, pid) => {
        statisticsLog.log('切换文件', filePath);
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
              completionLog.error('EditorSwitchSvn', e);
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
      reviewLog.info('ReviewRequest Response', data);
      const { id } = data;
      const referencesResolveHandle = this.referencesResolveHandleMap.get(id);
      if (referencesResolveHandle) {
        referencesResolveHandle(data.references || []);
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

  async getCodeReviewReferences(selectionData: SelectionData) {
    const successPromise = new Promise<Reference[]>((resolve) => {
      const id = uid();
      this.send(
        JSON.stringify(
          new ReviewRequestServerMessage({
            id,
            result: 'success',
            content: selectionData.block || selectionData.content,
            path: selectionData.file,
            beginLine: selectionData.range.begin.line,
            endLine: selectionData.range.end.line,
          }),
        ),
      );
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
