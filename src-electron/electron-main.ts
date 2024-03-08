import { app, globalShortcut } from 'electron';
import { scheduleJob } from 'node-schedule';

import { AutoUpdater } from 'main/components/AutoUpdater';
import { FloatingWindow } from 'main/components/FloatingWindow';
import { ImmersiveWindow } from 'main/components/ImmersiveWindow';
import { MainWindow } from 'main/components/MainWindow';
import { PromptExtractor } from 'main/components/PromptExtractor';
import { PromptProcessor } from 'main/components/PromptProcessor';
import { statisticsReporter } from 'main/components/StatisticsReporter';
import { TrayIcon } from 'main/components/TrayIcon';
import { MenuEntry } from 'main/components/TrayIcon/types';
import { websocketManager } from 'main/components/WebsocketManager';
import { initAdditionReport, initApplication, initIpcMain } from 'main/init';
import { configStore, dataStore } from 'main/stores';
import { ApiStyle } from 'main/types/model';
import { TextDocument } from 'main/types/TextDocument';
import { Position } from 'main/types/vscode/position';
import {
  CompletionErrorCause,
  getClientVersion,
  getProjectData,
} from 'main/utils/completion';
import { timer } from 'main/utils/timer';
import { registerAction } from 'preload/types/ActionApi';
import { ActionType } from 'shared/types/ActionMessage';
import {
  CompletionGenerateServerMessage,
  StandardResult,
  WsAction,
} from 'shared/types/WsMessage';

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(-1);
}

initAdditionReport();
initApplication();
initIpcMain();

const autoUpdater = new AutoUpdater(configStore.endpoints.update);
const floatingWindow = new FloatingWindow();
const immersiveWindow = new ImmersiveWindow();
const mainWindow = new MainWindow();
const promptProcessor = new PromptProcessor();
const trayIcon = new TrayIcon();

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
  ({ path, pid, projectId }) => {
    dataStore.setProjectId(path, projectId).catch();
    websocketManager.setClientProjectId(pid, projectId);
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
        .acceptCompletion(actionId, index, getClientVersion(pid))
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
        statisticsReporter.completionCancel(actionId, getClientVersion(pid));
        return;
      } catch {}
    }
    statisticsReporter.completionAbort(actionId);
  },
);
websocketManager.registerWsAction(
  WsAction.CompletionGenerate,
  async ({ data }, pid) => {
    const { caret, path, prefix, project, recentFiles, suffix, symbols } = data;
    const actionId = statisticsReporter.completionBegin(caret);
    console.debug('WsAction.CompletionGenerate', {
      caret,
      path,
      prefix,
      project,
      recentFiles,
      suffix,
      symbols,
    });

    try {
      const { id: projectId } = getProjectData(project);
      websocketManager.setClientProjectId(pid, projectId);
      statisticsReporter.generationUpdateProjectId(actionId, projectId);

      const promptElements = await new PromptExtractor(
        project,
        new TextDocument(path),
        new Position(caret.line, caret.character),
      ).getPromptComponents(prefix, recentFiles, suffix, symbols);
      statisticsReporter.generationUpdatePromptElements(
        actionId,
        promptElements,
      );

      const completions = await promptProcessor.process(
        promptElements,
        projectId,
      );
      if (completions) {
        statisticsReporter.completionGenerated(actionId, completions);

        console.log(timer.parse('CompletionGenerate'));
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
        case CompletionErrorCause.accessToken:
          result = 'failure';
          floatingWindow.login(mainWindow.isVisible);
          break;
        case CompletionErrorCause.clientInfo:
          result = 'failure';
          break;
        case CompletionErrorCause.projectData:
          result = 'failure';
          floatingWindow.projectId(project, pid);
          break;
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
    const { actionId, index, position } = data;
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
          position,
        );
      }
    } catch {
      statisticsReporter.completionAbort(actionId);
    }
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
websocketManager.registerWsAction(
  WsAction.EditorSwitchProject,
  ({ data: path }, pid) => {
    const id = dataStore.getProjectId(path);
    if (id) {
      websocketManager.setClientProjectId(pid, id);
    } else {
      floatingWindow.projectId(path, pid);
    }
  },
);

app.on('browser-window-blur', () => {
  globalShortcut.unregisterAll();
});
app.on('browser-window-focus', () => {
  globalShortcut.register('CommandOrControl+R', () => {
    console.log('CommandOrControl+R is pressed: Shortcut Disabled');
  });
  globalShortcut.register('CommandOrControl+Shift+R', () => {
    console.log('CommandOrControl+Shift+R is pressed: Shortcut Disabled');
  });
  globalShortcut.register('F5', () => {
    console.log('F5 is pressed: Shortcut Disabled');
  });
  globalShortcut.register('Shift+F5', () => {
    console.log('Shift+F5 is pressed: Shortcut Disabled');
  });
});
app.on('second-instance', () => {
  app.focus();
  mainWindow.activate();
});
app.whenReady().then(async () => {
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
