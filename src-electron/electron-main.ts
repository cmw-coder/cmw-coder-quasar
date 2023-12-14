import { app, ipcMain } from 'electron';

import { CompletionInlineWindow } from 'main/components/CompletionInlineWindow';
import { MainWindow } from 'main/components/MainWindow';
import { TrayIcon } from 'main/components/TrayIcon';
import { registerWsMessage, startServer } from 'main/server';
import { configStore, dataStore } from 'main/stores';
import { b64GbkToUtf8 } from 'main/utils/iconv';
import { parseSymbolString, parseTabString } from 'main/utils/parser';
import { controlApiKey } from 'shared/types/constants';
import {
  ControlMessage,
  triggerControlCallback,
} from 'preload/types/ControlApi';
import { WsAction } from 'shared/types/WsMessage';
import { statisticsReporter } from "main/components/StatisticsReporter";

if (app.requestSingleInstanceLock()) {
  const completionInlineWindow = new CompletionInlineWindow();
  const mainWindow = new MainWindow();
  const trayIcon = new TrayIcon();

  ipcMain.on(controlApiKey, (_, message: ControlMessage) => {
    triggerControlCallback(message.windowType, message.type, message.data);
  });
  app.on('second-instance', () => {
    app.focus();
    mainWindow.activate();
  });
  app.whenReady().then(() => {
    startServer().then(() => {
      registerWsMessage(WsAction.CompletionGenerate, (message) => {
        const { caret, path, prefix, suffix, symbolString, tabString } =
          message.data;
        const decodedPath = b64GbkToUtf8(path);
        const decodedPrefix = b64GbkToUtf8(prefix);
        const decodedSuffix = b64GbkToUtf8(suffix);

        const symbols = parseSymbolString(b64GbkToUtf8(symbolString));
        const tabs = parseTabString(b64GbkToUtf8(tabString));

        console.log({
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
            cursorRange.start
          ).getPromptComponents(tabs, symbols, decodedPrefix, decodedSuffix);
          const results = await promptProcessor.process(
            prompt,
            decodedPrefix,
            projectId
          );
          return {
            result: 'success',
            contents: results.map((result) =>
              encode(result, 'gb2312').toString('base64')
            ),
          };
        } catch (e) {
          Logger.warn('route.completion.generate', e);
          return { result: 'error', message: (<Error>e).message };
        }
      });
      trayIcon.activate();
      mainWindow.activate();
      trayIcon.onClick(() => mainWindow.activate());
      completionInlineWindow.activate();
    });
  });
} else {
  app.quit();
}
