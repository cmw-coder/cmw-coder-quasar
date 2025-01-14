import { ChatFileContent, ChatItem } from 'shared/types/ChatMessage';
import {
  AppData,
  ModelConfig,
} from 'shared/types/service/DataServiceTrait/types';

export interface DataServiceTrait {
  getStoreAsync(): Promise<AppData>;

  setStoreAsync<T extends keyof AppData>(
    key: T,
    value: AppData[T],
  ): Promise<void>;

  setProjectId(path: string, projectId: string): Promise<void>;

  setProjectLastAddedLines(path: string, lastAddedLines: number): Promise<void>;

  setProjectSvn(projectPath: string, svnPath: string): Promise<void>;

  getActiveModelContent(): Promise<ModelConfig>;

  getChatList(): Promise<ChatItem[]>;

  getChat(name: string): Promise<ChatFileContent>;

  newChat(name: string): Promise<string>;

  saveChat(name: string, content: ChatFileContent): Promise<string>;

  deleteChat(name: string): Promise<void>;

  openChatListDir(): Promise<void>;

  retrieveBackup(backupPath: string): Promise<ArrayBufferLike | undefined>;

  restoreBackup(isCurrent: boolean, index: number): Promise<boolean>;

  dismissNotice(noticeId: string): Promise<void>;
}
