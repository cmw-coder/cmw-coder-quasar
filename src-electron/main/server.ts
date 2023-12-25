import { Server, WebSocket } from 'ws';

import {
  WsClientMessageMapping,
  WsServerMessageMapping,
} from 'shared/types/WsMessage';
import { WsMessageHandler } from 'main/types/WsMessageHandler';

const wsMessageHandler = new WsMessageHandler();

export const registerWsMessage = <T extends keyof WsClientMessageMapping>(
  action: T,
  callback: (message: WsClientMessageMapping[T]) => WsServerMessageMapping[T]
) => {
  wsMessageHandler.registerMessage(action, callback);
};

// Todo: Implement ability to send messages to clients

export const startServer = async () => {
  const server = new Server({
    host: '127.0.0.1',
    port: 3000,
  });
  server.on('connection', (client: WebSocket) => {
    console.log('New client connected');

    client.on('message', async (message: string) => {
      const result = wsMessageHandler.handleAction(JSON.parse(message));
      if (result) {
        client.send(JSON.stringify(await result));
      }
    });

    client.on('close', () => {
      console.log('Client disconnected');
    });
  });
};
