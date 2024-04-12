import { app } from 'electron';
import log from 'electron-log/main';
import { scheduleJob } from 'node-schedule';

import { AutoUpdater } from 'main/components/AutoUpdater';
import { PromptExtractor } from 'main/components/PromptExtractor';
import { RawInputs } from 'main/components/PromptExtractor/types';
import { PromptProcessor } from 'main/components/PromptProcessor';
import { statisticsReporter } from 'main/components/StatisticsReporter';
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
import { configStore, dataStore } from 'main/stores';
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
import { AppService } from 'service/entities/AppService';
import { TYPES } from 'shared/service-interface/types';

const appService = container.get<AppService>(TYPES.AppService);

appService.init();

initApplication();
initAdditionReport();
initIpcMain();
initShortcutHandler();

const autoUpdater = new AutoUpdater(configStore.endpoints.update);
const floatingWindow = new FloatingWindow();
const immersiveWindow = new ImmersiveWindow();
const mainWindow = new MainWindow();
const promptExtractor = new PromptExtractor();
const promptProcessor = new PromptProcessor();
const trayIcon = new TrayIcon();

let immersiveWindowDestroyInterval = initWindowDestroyInterval(immersiveWindow);

autoUpdater.onAvailable((updateInfo) => floatingWindow.updateShow(updateInfo));
autoUpdater.onDownloading((progressInfo) =>
  floatingWindow.updateProgress(progressInfo),
);

autoUpdater.onFinish(() => floatingWindow.updateFinish());

trayIcon.onClick(() => mainWindow.activate());
trayIcon.registerMenuEntry(MenuEntry.Feedback, () => floatingWindow.feedback());
trayIcon.registerMenuEntry(MenuEntry.Quit, () => app.exit());

registerAction(
  ActionType.ClientSetProjectId,
  `main.main.${ActionType.ClientSetProjectId}`,
  ({ project, projectId }) => {
    dataStore.setProjectId(project, projectId).catch();
  },
);
registerAction(
  ActionType.UpdateDownload,
  `main.main.${ActionType.UpdateDownload}`,
  async () => {
    await autoUpdater.downloadUpdate();
  },
);
registerAction(
  ActionType.UpdateFinish,
  `main.main.${ActionType.UpdateFinish}`,
  () => autoUpdater.installUpdate(),
);

websocketManager.registerWsAction(
  WsAction.CompletionAccept,
  async ({ data }, pid) => {
    const { actionId, index } = data;
    immersiveWindow.completionClear();
    try {
      statisticsReporter
        .completionAccept(actionId, index, getClientVersion(pid))
        .catch();
    } catch {
      statisticsReporter.completionAbort(actionId);
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
        statisticsReporter
          .completionCancel(actionId, getClientVersion(pid))
          .catch();
        return;
      } catch {}
    }
    statisticsReporter.completionAbort(actionId);
  },
);
websocketManager.registerWsAction(WsAction.CompletionEdit, ({ data }, pid) => {
  const { actionId, count, editedContent, ratio } = data;
  try {
    statisticsReporter
      .completionEdit(
        actionId,
        count,
        editedContent,
        ratio,
        getClientVersion(pid),
      )
      .catch();
  } catch {
    statisticsReporter.completionAbort(actionId);
  }
});
websocketManager.registerWsAction(
  WsAction.CompletionGenerate,
  async ({ data }, pid) => {
    clearInterval(immersiveWindowDestroyInterval);
    immersiveWindowDestroyInterval = initWindowDestroyInterval(immersiveWindow);

    const { caret } = data;
    const actionId = statisticsReporter.completionBegin(caret);
    const project = websocketManager.getClientInfo(pid)?.currentProject;
    if (!project || !project.length) {
      return new CompletionGenerateServerMessage({
        result: 'failure',
        message: 'Invalid project path',
      });
    }

    try {
      const { id: projectId } = getProjectData(project);
      statisticsReporter.completionUpdateProjectId(actionId, projectId);

      const promptElements = await promptExtractor.getPromptComponents(
        new RawInputs(data, project),
      );
      statisticsReporter.completionUpdatePromptElements(
        actionId,
        promptElements,
      );

      const completions = await promptProcessor.process(
        promptElements,
        projectId,
      );
      if (completions) {
        statisticsReporter.completionGenerated(actionId, completions);

        log.log(timer.parse('CompletionGenerate'));
        timer.remove('CompletionGenerate');
        return new CompletionGenerateServerMessage({
          actionId,
          completions,
          result: 'success',
        });
      }

      statisticsReporter.completionAbort(actionId);
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

      statisticsReporter.completionAbort(actionId);
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
      const candidate = statisticsReporter.completionSelected(
        actionId,
        index,
        getClientVersion(pid),
      );
      if (candidate) {
        immersiveWindow.completionSelect(
          candidate,
          { index, total: statisticsReporter.completionCount(actionId) },
          height,
          { x, y },
        );
      }
    } catch {
      statisticsReporter.completionAbort(actionId);
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
      statisticsReporter
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
    configStore.apiStyle === ApiStyle.Linseer &&
    !(await configStore.getAccessToken())
  ) {
    floatingWindow.login(mainWindow.isVisible);
  }

  trayIcon.notify('正在检查更新……');
  autoUpdater.checkUpdate().catch();

  scheduleJob(
    {
      hour: 4,
      minute: 0,
    },
    () => {
      trayIcon.notify('正在检查更新……');
      autoUpdater.checkUpdate().catch();
    },
  );
});
