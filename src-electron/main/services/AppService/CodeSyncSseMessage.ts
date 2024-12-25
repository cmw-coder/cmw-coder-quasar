import codeSyncTaskLog from 'main/components/Loggers/codeSyncTaskLog';
import { Disposable } from 'main/utils/Disposable';

export interface ServerTask {
  id: number;
}

export enum CodeSyncSseMessageDataType {
  ConnectSuccess = 'ConnectSuccess',
  TaskUpdate = 'TaskUpdate',
}

export interface ConnectSuccessMessage {
  type: CodeSyncSseMessageDataType.ConnectSuccess;
  data: undefined;
}

export interface TaskUpdateMessage {
  type: CodeSyncSseMessageDataType.TaskUpdate;
  data: ServerTask;
}

type MessageData = ConnectSuccessMessage | TaskUpdateMessage;

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
    this.sseEvent = new EventSource(this.serverUrl);
    this.sseEvent.onmessage = (event) => {
      for (let i = 0; i < this.dataCallbackList.length; i++) {
        this.dataCallbackList[i](JSON.parse(event.data));
      }
    };
    this.sseEvent.onopen = () => {
      codeSyncTaskLog.log('SSE连接成功', this.serverUrl);
    };
    this.sseEvent.onerror = (e) => {
      codeSyncTaskLog.log('SSE连接失败', this.serverUrl, e);
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
