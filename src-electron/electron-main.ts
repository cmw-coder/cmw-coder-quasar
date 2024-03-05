import axios from 'axios';
import { exec } from 'child_process';
import { app, dialog, globalShortcut } from 'electron';
import { scheduleJob } from 'node-schedule';
import { promisify } from 'util';

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
import { timer } from 'main/utils/timer';
import { registerAction } from 'preload/types/ActionApi';
import packageJson from 'root/package.json';
import { ActionType } from 'shared/types/ActionMessage';
import {
  CompletionGenerateServerMessage,
  WsAction,
} from 'shared/types/WsMessage';

const childExec = promisify(exec);

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
  () => checkUpdate(),
);

async function checkRemoteFileExists(url: string): Promise<boolean> {
  try {
    const response = await axios.head(url);
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

async function isRunning(): Promise<boolean> {
  const cmd = 'tasklist';
  const { stdout } = await childExec(cmd);
  return (
    stdout.toLowerCase().indexOf('insight3.exe') > -1 ||
    stdout.toLowerCase().indexOf('sourceinsight4.exe') > -1
  );
}

async function checkUpdate() {
  trayIcon.notify('正在更新……');
  //检查source insight 进程
  const isRun = await isRunning();
  const isDllExists = await checkRemoteFileExists(
    configStore.endpoints.update + '/needUpdateDLL',
  );
  //弹框提示 确定后才会checkUpdate
  if (isRun && isDllExists) {
    dialog
      .showMessageBox({
        type: 'info',
        title: '应用更新',
        message: 'source insight正在运行请关闭后点击是安装最新插件',
        buttons: ['是', '否'],
      })
      .then(async (buttonIndex) => {
        if (buttonIndex.response == 0) {
          //选择是，则退出程序，安装新版本
          await checkUpdate();
        }
      });
  } else {
    autoUpdater.installUpdate();
  }
}

websocketManager.registerWsAction(
  WsAction.CompletionAccept,
  async ({ data }, pid) => {
    const clientInfo = websocketManager.getClientInfo(pid);
    if (clientInfo) {
      const { projectId, version } = clientInfo;
      immersiveWindow.completionClear();
      statisticsReporter
        .acceptCompletion(
          data,
          Date.now(),
          Date.now(),
          projectId,
          `${packageJson.version}${version}`,
        )
        .catch();
    }
  },
);
websocketManager.registerWsAction(
  WsAction.CompletionCache,
  ({ data: isDelete }) => {
    immersiveWindow.completionUpdate(isDelete);
  },
);
websocketManager.registerWsAction(WsAction.CompletionCancel, () => {
  immersiveWindow.completionClear();
});
websocketManager.registerWsAction(
  WsAction.CompletionGenerate,
  async ({ data }, pid) => {
    timer.add('CompletionGenerate', 'ReceivedWebsocketMessage');
    const clientInfo = websocketManager.getClientInfo(pid);
    if (!clientInfo) {
      return new CompletionGenerateServerMessage({
        result: 'failure',
        message: 'Completion Generate Failed, invalid client info.',
      });
    }
    const { version } = clientInfo;
    const { caret, path, prefix, project, recentFiles, suffix, symbols } = data;

    console.log('WsAction.CompletionGenerate', {
      caret,
      path,
      prefix,
      project,
      recentFiles,
      suffix,
      symbols,
    });

    timer.add('CompletionGenerate', 'ParsedMessageData');

    const projectData = dataStore.project[project];
    if (!projectData) {
      floatingWindow.projectId(project, pid);
      return new CompletionGenerateServerMessage({
        result: 'failure',
        message: 'Completion Generate Failed, no valid project id',
      });
    } else {
      if (!projectData.svn.length) {
        dataStore.setProjectRevision(project).catch();
      }
      websocketManager.setClientProjectId(pid, projectData.id);
    }

    timer.add('CompletionGenerate', 'GotProjectData');

    try {
      statisticsReporter.updateCaretPosition(caret);
      const promptElements = await new PromptExtractor(
        project,
        new TextDocument(path),
        new Position(caret.line, caret.character),
      ).getPromptComponents(prefix, recentFiles, suffix, symbols);
      timer.add('CompletionGenerate', 'CalculatedPromptComponents');
      const completions = await promptProcessor.process(
        promptElements,
        projectData.id,
      );
      timer.add('CompletionGenerate', 'RetrievedCompletions');
      console.log(timer.parse('CompletionGenerate'));
      timer.remove('CompletionGenerate');
      if (completions && completions.length) {
        statisticsReporter
          .generateCompletion(
            completions[0],
            Date.now(),
            Date.now(),
            projectData.id,
            `${packageJson.version}${version}`,
          )
          .catch();
        return new CompletionGenerateServerMessage({
          completions: completions,
          result: 'success',
        });
      }
      return new CompletionGenerateServerMessage({
        result: 'failure',
        message: 'Completion Generate Failed, maybe need login first?',
      });
    } catch (e) {
      console.warn('route.completion.generate', e);
      return new CompletionGenerateServerMessage({
        result: 'error',
        message: (<Error>e).message,
      });
    }
  },
);
websocketManager.registerWsAction(WsAction.CompletionSelect, ({ data }) => {
  const { completion, count, position } = data;
  immersiveWindow.completionSet(completion, count, position);
});
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

  if (configStore.apiStyle === ApiStyle.Linseer) {
    configStore.onLogin = () => floatingWindow.login(mainWindow.isVisible);
    if (!(await configStore.getAccessToken())) {
      configStore.login();
    }
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
