import { Server } from 'ws';

import {
  HandShakeClientMessage,
  WsAction,
  WsMessageMapping,
} from 'shared/types/WsMessage';

interface ClientInfo {
  projectId: string;
  version: string;
}

class WebsocketManager {
  private _clientInfoMap = new Map<number, ClientInfo>();
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

  setClientProjectId(pid: number, projectId: string) {
    const clientInfo = this._clientInfoMap.get(pid);
    if (clientInfo) {
      clientInfo.projectId = projectId;
    }
  }

  startServer() {
    this._server = new Server({
      host: '127.0.0.1',
      port: 3000,
    });
    this._server.on('connection', (client) => {
      let pid: number;
      console.log(`${client.url} connected`);

      client.on('message', async (message: string) => {
        const clientMessage = JSON.parse(message);
        if (clientMessage.action === WsAction.HandShake) {
          const { data } = <HandShakeClientMessage>clientMessage;
          pid = data.pid;
          this._clientInfoMap.set(pid, {
            projectId: '',
            version: data.version,
          });
          console.log('Client verified, pid:', pid);
        } else {
          if (!pid) {
            console.log('Client not verified');
            client.close();
            return;
          }
          const handler = this._handlers.get(clientMessage.action);
          if (handler) {
            const result = await handler(clientMessage, pid);
            if (result) {
              client.send(JSON.stringify(result));
            }
          }
        }
      });

      client.on('close', () => {
        console.log(`Client (${pid}) disconnected`);
      });
    });
  }
}

export const websocketManager = new WebsocketManager();
