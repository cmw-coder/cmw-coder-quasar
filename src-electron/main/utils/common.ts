import { BrowserWindow } from 'electron';

export const historyToHash = (historyRoute: URL) => {
  return new URL(
    `${historyRoute.protocol}//${historyRoute.host}/#${historyRoute.pathname}${historyRoute.search}`
  );
};

export const bypassCors = (window: BrowserWindow) =>
  window.webContents.session.webRequest.onHeadersReceived(
    (details, callback) => {
      callback({
        responseHeaders: {
          'Access-Control-Allow-Origin': ['*'],
          'Access-Control-Allow-Headers': ['*'],
          ...details.responseHeaders,
        },
      });
    }
  );
