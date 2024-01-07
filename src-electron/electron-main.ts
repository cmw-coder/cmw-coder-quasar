import { app, ipcMain } from 'electron';
import { decode, encode } from 'iconv-lite';

import { FloatingWindow } from 'main/components/FloatingWindow';
import { ImmersiveWindow } from 'main/components/ImmersiveWindow';
import { MainWindow } from 'main/components/MainWindow';
import { PromptExtractor } from 'main/components/PromptExtractor';
import { PromptProcessor } from 'main/components/PromptProcessor';
import { statisticsReporter } from 'main/components/StatisticsReporter';
import { TrayIcon } from 'main/components/TrayIcon';
import { registerWsMessage, startServer } from 'main/server';
import { configStore } from 'main/stores';
import { ApiStyle } from 'main/types/model';
import { TextDocument } from 'main/types/TextDocument';
import { Position } from 'main/types/vscode/position';
import { parseSymbolString, parseTabString } from 'main/utils/parser';

import {
  ControlMessage,
  triggerControlCallback,
} from 'preload/types/ControlApi';

import { actionApiKey, controlApiKey } from 'shared/types/constants';
import { ActionMessage } from 'shared/types/ActionMessage';
import {
  CompletionCacheServerMessage,
  CompletionCancelServerMessage,
  CompletionGenerateServerMessage,
  ImmersiveHideServerMessage,
  ImmersiveShowServerMessage,
  WsAction,
} from 'shared/types/WsMessage';
import { triggerActionCallback } from 'preload/types/ActionApi';

if (app.requestSingleInstanceLock()) {
  app.disableHardwareAcceleration();

  const immersiveWindow = new ImmersiveWindow();
  const mainWindow = new MainWindow();
  const floatingWindow = new FloatingWindow();
  const trayIcon = new TrayIcon();

  ipcMain.on(actionApiKey, (_, message: ActionMessage) =>
    triggerActionCallback(message.type, message.data)
  );
  ipcMain.on(controlApiKey, (_, message: ControlMessage) =>
    triggerControlCallback(message.windowType, message.type, message.data)
  );

  app.on('second-instance', () => {
    app.focus();
    mainWindow.activate();
  });
  app.whenReady().then(() => {
    startServer().then(async () => {
      const promptProcessor = new PromptProcessor();
      registerWsMessage(WsAction.CompletionCache, ({ data: isDelete }) => {
        immersiveWindow.completionUpdate(isDelete);
        return new CompletionCacheServerMessage({ result: 'success' });
      });
      registerWsMessage(WsAction.CompletionCancel, () => {
        immersiveWindow.completionClear();
        return new CompletionCancelServerMessage({ result: 'success' });
      });
      registerWsMessage(WsAction.CompletionGenerate, async ({ data }) => {
        const {
          caret,
          path,
          prefix,
          projectId,
          suffix,
          symbolString,
          tabString,
        } = data;
        const decodedPath = decode(Buffer.from(path, 'base64'), 'gb2312');
        const decodedPrefix = decode(Buffer.from(prefix, 'base64'), 'gb2312');
        const decodedSuffix = decode(Buffer.from(suffix, 'base64'), 'gb2312');

        const symbols = parseSymbolString(
          decode(Buffer.from(symbolString, 'base64'), 'gb2312')
        );
        const tabs = parseTabString(
          decode(Buffer.from(tabString, 'base64'), 'gb2312')
        );

        console.log('WsAction.CompletionGenerate', {
          caret,
          path: decodedPath,
          prefix: decodedPrefix,
          suffix: decodedSuffix,
          symbols,
          tabs,
        });

        try {
          statisticsReporter.updateCaretPosition(caret);
          const prompt = await new PromptExtractor(
            new TextDocument(decodedPath),
            new Position(caret.line, caret.character)
          ).getPromptComponents(tabs, symbols, decodedPrefix, decodedSuffix);
          const completions = await promptProcessor.process(
            prompt,
            decodedPrefix,
            projectId
          );
          if (completions) {
            immersiveWindow.completionSet(
              completions,
              caret.xPixel,
              caret.yPixel
            );
            return new CompletionGenerateServerMessage({
              completions: completions.contents.map((content) =>
                encode(content, 'gb2312').toString('base64')
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
      });
      registerWsMessage(WsAction.ImmersiveHide, () => {
        immersiveWindow.hide();
        return new ImmersiveHideServerMessage({ result: 'success' });
      });
      registerWsMessage(WsAction.ImmersiveShow, () => {
        immersiveWindow.show();
        return new ImmersiveShowServerMessage({ result: 'success' });
      });
      // registerWsMessage(WsAction.CompletionAccept, (message) => {
      //   statisticsReporter.acceptCompletion(
      //     message.data.completion,
      //     Date.now(),
      //     Date.now(),
      //     "",
      //     "",
      //     ""
      //   );
      //   return new CompletionAcceptServerMessage({ result: 'success' });
      // });

      floatingWindow.activate();
      immersiveWindow.activate();
      mainWindow.activate();
      trayIcon.activate();

      trayIcon.onClick(() => mainWindow.activate());
      if (configStore.apiStyle === ApiStyle.Linseer) {
        configStore.onLogin = (userId) =>
          floatingWindow.login(userId, mainWindow.isVisible);
        if (!(await configStore.getAccessToken())) {
          configStore.login();
        }
      }
    });
  });
} else {
  app.quit();
}
