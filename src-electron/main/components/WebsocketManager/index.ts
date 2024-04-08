import log from 'electron-log/main';
import { Server, WebSocket } from 'ws';

import {
  HandShakeClientMessage,
  WsAction,
  WsMessageMapping,
} from 'shared/types/WsMessage';

interface ClientInfo {
  client: WebSocket;
  version: string;
}

class WebsocketManager {
  private _clientInfoMap = new Map<number, ClientInfo>();
  private _lastActivePid = 0;
  private _handlers = new Map<
    WsAction,
    (
      message: WsMessageMapping[keyof WsMessageMapping]['client'],
      pid: number,
    ) => WsMessageMapping[keyof WsMessageMapping]['server']
  >();
  private _server: Server | undefined;

  getClientInfo(pid: number) {
    return this._clientInfoMap.get(pid);
  }

  registerWsAction<T extends keyof WsMessageMapping>(
    wsAction: T,
    callback: (
      message: WsMessageMapping[T]['client'],
      pid: number,
    ) => WsMessageMapping[T]['server'],
  ) {
    this._handlers.set(wsAction, callback);
  }

  send(message: string, pid?: number) {
    const client = this.getClientInfo(pid ?? this._lastActivePid)?.client;
    if (client) {
      client.send(message);
    }
  }

  startServer() {
    this._server = new Server({
      host: '127.0.0.1',
      port: 3000,
    });
    this._server.on('connection', (client) => {
      let pid: number;

      client.on('message', async (message: string) => {
        const clientMessage = JSON.parse(message);
        if (clientMessage.action === WsAction.HandShake) {
          const { data } = <HandShakeClientMessage>clientMessage;
          pid = data.pid;
          this._clientInfoMap.set(pid, {
            client: client,
            version: data.version,
          });
          this._lastActivePid = pid;
          log.info(`Websocket client verified, pid: ${pid}`);
        } else {
          if (!pid) {
            log.info('Websocket client not verified');
            client.close();
            return;
          }
          const handler = this._handlers.get(clientMessage.action);
          if (handler) {
            this._lastActivePid = pid;
            const result = await handler(clientMessage, pid);
            if (result) {
              client.send(JSON.stringify(result));
            }
          }
        }
      });

      client.on('close', () => {
        log.info(`Client (${pid}) disconnected`);
      });
    });
  }
}

export const websocketManager = new WebsocketManager();
