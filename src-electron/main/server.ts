import { WebContents } from 'electron';
import { Server, WebSocket } from 'ws';

import { Action } from 'types/action';
import { ActionManager } from 'types/ActionManager';

const actionManager = new ActionManager();

export const forwardActions = (webContents: WebContents) => {
  Object.values(Action).forEach((action) => {
    actionManager.registerAction(action, (message) =>
      webContents.send('action', message)
    );
  });
};
export const startServer = async () => {
  const server = new Server({
    host: '127.0.0.1',
    port: 3000,
  });
  server.on('connection', (client: WebSocket) => {
    console.log('New client connected');

    client.on('message', (message: string) => {
      actionManager.handleAction(JSON.parse(message));
    });

    client.on('close', () => {
      console.log('Client disconnected');
    });
  });
};
