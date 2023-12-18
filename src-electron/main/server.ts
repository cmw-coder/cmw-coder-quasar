import { Server, WebSocket } from 'ws';

import { WsMessageMapping } from 'shared/types/WsMessage';
import { WsMessageHandler } from 'main/types/WsMessageHandler';

const wsMessageHandler = new WsMessageHandler();

export const registerWsMessage = <T extends keyof WsMessageMapping>(
  action: T,
  callback: (message: WsMessageMapping[T]) => void
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

    client.on('message', (message: string) => {
      wsMessageHandler.handleAction(JSON.parse(message));
    });

    client.on('close', () => {
      console.log('Client disconnected');
    });
  });
};
