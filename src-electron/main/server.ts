import { Server, WebSocket } from 'ws';

import { ActionManager } from 'types/ActionManager';
import { Action, ActionMessage } from 'types/action';

const actionManager = new ActionManager();

export const registerAction = (
  action: Action,
  callback: (message: ActionMessage) => void
) => {
  actionManager.registerAction(action, callback);
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
