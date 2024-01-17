import { app } from 'electron';
import { encode } from 'iconv-lite';

import { FloatingWindow } from 'main/components/FloatingWindow';
import { ImmersiveWindow } from 'main/components/ImmersiveWindow';
import { MainWindow } from 'main/components/MainWindow';
import { PromptExtractor } from 'main/components/PromptExtractor';
import { PromptProcessor } from 'main/components/PromptProcessor';
import { statisticsReporter } from 'main/components/StatisticsReporter';
import { TrayIcon } from 'main/components/TrayIcon';
import { MenuEntry } from 'main/components/TrayIcon/types';
import { websocketManager } from 'main/components/WebsocketManager';
import { initApplication, initIpcMain } from 'main/init';
import { configStore, dataStore } from 'main/stores';
import { ApiStyle } from 'main/types/model';
import { TextDocument } from 'main/types/TextDocument';
import { Position } from 'main/types/vscode/position';
import { registerActionCallback } from 'preload/types/ActionApi';
import packageJson from 'root/package.json';
import { ActionType } from 'shared/types/ActionMessage';
import {
  CompletionGenerateServerMessage,
  WsAction,
} from 'shared/types/WsMessage';

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(-1);
}

initApplication();
initIpcMain();

const floatingWindow = new FloatingWindow();
const immersiveWindow = new ImmersiveWindow();
const mainWindow = new MainWindow();
const promptProcessor = new PromptProcessor();
const trayIcon = new TrayIcon();

trayIcon.onClick(() => mainWindow.activate());
trayIcon.registerMenuEntry(MenuEntry.Feedback, () => mainWindow.feedback());
trayIcon.registerMenuEntry(MenuEntry.Quit, () => app.exit());

registerActionCallback(
  ActionType.ClientSetProjectId,
  ({ path, pid, projectId }) => {
    dataStore.setProjectId(path, projectId);
    websocketManager.setClientProjectId(pid, projectId);
  }
);

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
          `${packageJson.version}${version}`
        )
        .catch();
    }
  }
);
websocketManager.registerWsAction(
  WsAction.CompletionCache,
  ({ data: isDelete }) => {
    immersiveWindow.completionUpdate(isDelete);
  }
);
websocketManager.registerWsAction(WsAction.CompletionCancel, () => {
  immersiveWindow.completionClear();
});
websocketManager.registerWsAction(
  WsAction.CompletionGenerate,
  async ({ data }, pid) => {
    const clientInfo = websocketManager.getClientInfo(pid);
    if (!clientInfo) {
      return new CompletionGenerateServerMessage({
        result: 'failure',
        message: 'Completion Generate Failed, invalid client info.',
      });
    }
    const { version } = clientInfo;
    const { caret, path, prefix, project, recentFiles, suffix, symbols } = data;
    const projectId = dataStore.getProjectId(project);
    if (!projectId) {
      floatingWindow.projectId(project, pid);
      return new CompletionGenerateServerMessage({
        result: 'failure',
        message: 'Completion Generate Failed, no valid project id',
      });
    }
    console.log('WsAction.CompletionGenerate', {
      caret,
      path,
      prefix,
      recentFiles,
      suffix,
      symbols,
    });

    try {
      statisticsReporter.updateCaretPosition(caret);
      const promptElements = await new PromptExtractor(
        project,
        new TextDocument(path),
        new Position(caret.line, caret.character)
      ).getPromptComponents(prefix, recentFiles, suffix, symbols);
      const completions = await promptProcessor.process(
        promptElements,
        prefix,
        projectId
      );
      if (completions && completions.length) {
        statisticsReporter
          .generateCompletion(
            completions[0],
            Date.now(),
            Date.now(),
            projectId,
            `${packageJson.version}${version}`
          )
          .catch();
        return new CompletionGenerateServerMessage({
          completions: completions.map((completion) =>
            encode(completion, 'gbk').toString()
          ),
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
  }
);
websocketManager.registerWsAction(WsAction.CompletionSelect, ({ data }) => {
  const { completion, count, position } = data;
  immersiveWindow.completionSet(completion, count, position);
});
websocketManager.registerWsAction(
  WsAction.EditorFocusState,
  ({ data: isFocused }) => {
    if (isFocused) {
      immersiveWindow.show();
    } else {
      immersiveWindow.hide();
    }
  }
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
  }
);

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
});
