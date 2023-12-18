import { app, ipcMain } from 'electron';

import { CompletionInlineWindow } from 'main/components/CompletionInlineWindow';
import { MainWindow } from 'main/components/MainWindow';
import { TrayIcon } from 'main/components/TrayIcon';
import { registerWsMessage, startServer } from 'main/server';
import { b64GbkToUtf8 } from 'main/utils/iconv';
import { controlApiKey } from 'shared/types/constants';
import {
  ControlMessage,
  triggerControlCallback,
} from 'preload/types/ControlApi';
import { WsAction } from 'shared/types/WsMessage';
import {
  parseCursorString,
  parseSymbolString,
  parseTabString,
} from 'main/utils/parser';

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
        const { cursor, path, prefix, suffix, symbolString, tabString } =
          message.data;
        const decodedPath = b64GbkToUtf8;
        const decodedPrefix = decode(Buffer.from(prefix, 'base64'), 'gb2312');
        const decodedSuffix = decode(Buffer.from(suffix, 'base64'), 'gb2312');

        const symbols = parseSymbolString(b64GbkToUtf8(symbolString));
        const tabs = parseTabString(b64GbkToUtf8(tabString));

        try {
          fastify.statistics.updateCursor(cursorRange);
          const prompt = await new PromptExtractor(
            new TextDocument(decodedPath),
            cursorRange.start,
          ).getPromptComponents(tabs, symbols, decodedPrefix, decodedSuffix);
          const results = await promptProcessor.process(
            prompt,
            decodedPrefix,
            projectId,
          );
          return {
            result: 'success',
            contents: results.map((result) =>
              encode(result, 'gb2312').toString('base64'),
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
