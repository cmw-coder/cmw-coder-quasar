import codeSyncTaskLog from 'main/components/Loggers/codeSyncTaskLog';
import { Disposable } from 'main/utils/Disposable';
import EventSource from 'eventsource';
import packageJson from 'root/package.json';

export interface ServerTask {
  id: number;
}

export enum CodeSyncSseMessageDataType {
  ConnectSuccess = 'ConnectSuccess',
  TaskUpdate = 'TaskUpdate',
  KeepAlive = 'KeepAlive',
}

export interface ConnectSuccessMessage {
  type: CodeSyncSseMessageDataType.ConnectSuccess;
  data: undefined;
}

export interface TaskUpdateMessage {
  type: CodeSyncSseMessageDataType.TaskUpdate;
  data: ServerTask;
}

export interface KeepAliveMessage {
  type: CodeSyncSseMessageDataType.KeepAlive;
  data: undefined;
}

type MessageData = ConnectSuccessMessage | TaskUpdateMessage | KeepAliveMessage;

export class CodeSyncSseMessage {
  private sseEvent: EventSource;
  private dataCallbackList: ((data: MessageData) => void)[] = [];
  private sseUrl: string;

  constructor(
    private serverUrl: string,
    private username: string,
  ) {
    this.sseUrl = `${this.serverUrl}/kong/codeSync/api/v1/sse/connect/${this.username}`;
    codeSyncTaskLog.log('SSE连接中', this.sseUrl);
    this.sseEvent = new EventSource(this.sseUrl, {
      headers: {
        'User-Agent': `${packageJson.productName}/${packageJson.version}`,
      },
    });
    this.sseEvent.onmessage = (event) => {
      for (let i = 0; i < this.dataCallbackList.length; i++) {
        this.dataCallbackList[i](JSON.parse(event.data));
      }
    };
    this.sseEvent.onopen = () => {
      codeSyncTaskLog.log('SSE连接成功', this.sseUrl);
    };
    this.sseEvent.onerror = (e) => {
      codeSyncTaskLog.log('SSE连接失败', this.sseUrl, e);
    };
  }

  addOnDataCallBack(callback: (data: MessageData) => void) {
    this.dataCallbackList.push(callback);
    return new Disposable(() => {
      const index = this.dataCallbackList.indexOf(callback);
      if (index >= 0) {
        this.dataCallbackList.splice(index, 1);
      }
    });
  }

  close() {
    this.sseEvent.close();
  }
}
