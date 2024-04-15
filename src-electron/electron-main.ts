import { app } from 'electron';
import log from 'electron-log/main';
import { scheduleJob } from 'node-schedule';

import { PromptExtractor } from 'main/components/PromptExtractor';
import { RawInputs } from 'main/components/PromptExtractor/types';
import { PromptProcessor } from 'main/components/PromptProcessor';
import { TrayIcon } from 'main/components/TrayIcon';
import { MenuEntry } from 'main/components/TrayIcon/types';
import { websocketManager } from 'main/components/WebsocketManager';
import {
  initAdditionReport,
  initApplication,
  initIpcMain,
  initShortcutHandler,
  initWindowDestroyInterval,
} from 'main/init';
import {
  CompletionErrorCause,
  getClientVersion,
  getProjectData,
} from 'main/utils/completion';
import { timer } from 'main/utils/timer';
import { FloatingWindow } from 'main/windows/FloatingWindow';
import { ImmersiveWindow } from 'main/windows/ImmersiveWindow';
import { MainWindow } from 'main/windows/MainWindow';
import { registerAction } from 'preload/types/ActionApi';
import { ApiStyle } from 'shared/types/model';
import { ActionType } from 'shared/types/ActionMessage';
import {
  CompletionGenerateServerMessage,
  StandardResult,
  WsAction,
} from 'shared/types/WsMessage';
import { container } from 'service/inversify.config';
import { TYPES } from 'shared/service-interface/types';
import type { AppService } from 'service/entities/AppService';
import type { UpdaterService } from 'service/entities/UpdaterService';
import type { ConfigService } from 'service/entities/ConfigService';
import type { DataStoreService } from 'service/entities/DataStoreService';
import { StatisticsReporterService } from 'service/entities/StatisticsReporterService';

const appService = container.get<AppService>(TYPES.AppService);
const updaterService = container.get<UpdaterService>(TYPES.UpdaterService);
const configService = container.get<ConfigService>(TYPES.ConfigService);
const dataStoreService = container.get<DataStoreService>(
  TYPES.DataStoreService,
);
const statisticsReporterService = container.get<StatisticsReporterService>(
  TYPES.StatisticsReporterService,
);

appService.init();
updaterService.init();

initApplication();
initAdditionReport();
initIpcMain();
initShortcutHandler();

const floatingWindow = new FloatingWindow();
const immersiveWindow = new ImmersiveWindow();
const mainWindow = new MainWindow();
const promptExtractor = new PromptExtractor();
const promptProcessor = new PromptProcessor();
const trayIcon = new TrayIcon();

let immersiveWindowDestroyInterval = initWindowDestroyInterval(immersiveWindow);

updaterService.onAvailable((updateInfo) =>
  floatingWindow.updateShow(updateInfo),
);
updaterService.onDownloading((progressInfo) =>
  floatingWindow.updateProgress(progressInfo),
);

updaterService.onFinish(() => floatingWindow.updateFinish());

trayIcon.onClick(() => mainWindow.activate());
trayIcon.registerMenuEntry(MenuEntry.Feedback, () => floatingWindow.feedback());
trayIcon.registerMenuEntry(MenuEntry.Quit, () => app.exit());

registerAction(
  ActionType.ClientSetProjectId,
  `main.main.${ActionType.ClientSetProjectId}`,
  ({ project, projectId }) => {
    dataStoreService.dataStore.setProjectId(project, projectId).catch();
  },
);
registerAction(
  ActionType.UpdateDownload,
  `main.main.${ActionType.UpdateDownload}`,
  async () => {
    await updaterService.downloadUpdate();
  },
);
registerAction(
  ActionType.UpdateFinish,
  `main.main.${ActionType.UpdateFinish}`,
  () => updaterService.installUpdate(),
);

websocketManager.registerWsAction(
  WsAction.CompletionAccept,
  async ({ data }, pid) => {
    const { actionId, index } = data;
    immersiveWindow.completionClear();
    try {
      statisticsReporterService
        .completionAccept(actionId, index, getClientVersion(pid))
        .catch();
    } catch {
      statisticsReporterService.completionAbort(actionId);
    }
  },
);
websocketManager.registerWsAction(
  WsAction.CompletionCache,
  ({ data: isDelete }) => {
    immersiveWindow.completionUpdate(isDelete);
  },
);
websocketManager.registerWsAction(
  WsAction.CompletionCancel,
  ({ data }, pid) => {
    immersiveWindow.completionClear();
    const { actionId, explicit } = data;
    if (explicit) {
      try {
        statisticsReporterService
          .completionCancel(actionId, getClientVersion(pid))
          .catch();
        return;
      } catch {}
    }
    statisticsReporterService.completionAbort(actionId);
  },
);
websocketManager.registerWsAction(WsAction.CompletionEdit, ({ data }, pid) => {
  const { actionId, count, editedContent, ratio } = data;
  try {
    statisticsReporterService
      .completionEdit(
        actionId,
        count,
        editedContent,
        ratio,
        getClientVersion(pid),
      )
      .catch();
  } catch {
    statisticsReporterService.completionAbort(actionId);
  }
});
websocketManager.registerWsAction(
  WsAction.CompletionGenerate,
  async ({ data }, pid) => {
    clearInterval(immersiveWindowDestroyInterval);
    immersiveWindowDestroyInterval = initWindowDestroyInterval(immersiveWindow);

    const { caret } = data;
    const actionId = statisticsReporterService.completionBegin(caret);
    const project = websocketManager.getClientInfo(pid)?.currentProject;
    if (!project || !project.length) {
      return new CompletionGenerateServerMessage({
        result: 'failure',
        message: 'Invalid project path',
      });
    }

    try {
      const { id: projectId } = getProjectData(project);
      statisticsReporterService.completionUpdateProjectId(actionId, projectId);

      const promptElements = await promptExtractor.getPromptComponents(
        new RawInputs(data, project),
      );
      statisticsReporterService.completionUpdatePromptElements(
        actionId,
        promptElements,
      );

      const completions = await promptProcessor.process(
        promptElements,
        projectId,
      );
      if (completions) {
        statisticsReporterService.completionGenerated(actionId, completions);

        log.log(timer.parse('CompletionGenerate'));
        timer.remove('CompletionGenerate');
        return new CompletionGenerateServerMessage({
          actionId,
          completions,
          result: 'success',
        });
      }

      statisticsReporterService.completionAbort(actionId);
      timer.remove('CompletionGenerate');
    } catch (e) {
      const error = <Error>e;
      let result: StandardResult['result'] = 'error';
      switch (error.cause) {
        case CompletionErrorCause.accessToken: {
          result = 'failure';
          floatingWindow.login(mainWindow.isVisible);
          break;
        }
        case CompletionErrorCause.clientInfo: {
          result = 'failure';
          break;
        }
        case CompletionErrorCause.projectData: {
          result = 'failure';
          floatingWindow.projectId(project);
          break;
        }
      }

      statisticsReporterService.completionAbort(actionId);
      timer.remove('CompletionGenerate');
      return new CompletionGenerateServerMessage({
        result,
        message: error.message,
      });
    }
  },
);
websocketManager.registerWsAction(
  WsAction.CompletionSelect,
  ({ data }, pid) => {
    const {
      actionId,
      index,
      dimensions: { height, x, y },
    } = data;
    try {
      const candidate = statisticsReporterService.completionSelected(
        actionId,
        index,
        getClientVersion(pid),
      );
      if (candidate) {
        immersiveWindow.completionSelect(
          candidate,
          { index, total: statisticsReporterService.completionCount(actionId) },
          height,
          { x, y },
        );
      }
    } catch {
      statisticsReporterService.completionAbort(actionId);
    }
  },
);
websocketManager.registerWsAction(
  WsAction.EditorCommit,
  ({ data: currentFile }) => {
    floatingWindow.commit(currentFile);
  },
);
websocketManager.registerWsAction(
  WsAction.EditorFocusState,
  ({ data: isFocused }) => {
    if (isFocused) {
      // immersiveWindow.show();
    } else {
      immersiveWindow.hide();
    }
  },
);
websocketManager.registerWsAction(WsAction.EditorPaste, ({ data }, pid) => {
  const { count } = data;
  const project = websocketManager.getClientInfo(pid)?.currentProject;
  if (project && project.length) {
    try {
      const { id: projectId } = getProjectData(project);
      statisticsReporterService
        .copiedLines(count, projectId, getClientVersion(pid))
        .catch();
    } catch (e) {
      const error = <Error>e;
      switch (error.cause) {
        case CompletionErrorCause.projectData: {
          floatingWindow.projectId(project);
          break;
        }
        default: {
          break;
        }
      }
    }
  }
});

app.on('second-instance', () => {
  app.focus();
  mainWindow.activate();
});
app.whenReady().then(async () => {
  log.info('Comware Coder is ready');
  floatingWindow.activate();
  immersiveWindow.activate();
  mainWindow.activate();
  trayIcon.activate();

  websocketManager.startServer();

  if (
    configService.configStore.apiStyle === ApiStyle.Linseer &&
    !(await configService.configStore.getAccessToken())
  ) {
    floatingWindow.login(mainWindow.isVisible);
  }

  trayIcon.notify('正在检查更新……');
  updaterService.checkUpdate().catch();

  scheduleJob(
    {
      hour: 4,
      minute: 0,
    },
    () => {
      trayIcon.notify('正在检查更新……');
      updaterService.checkUpdate().catch();
    },
  );
});
