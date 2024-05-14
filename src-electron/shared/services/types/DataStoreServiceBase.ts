import { AppData } from 'shared/types/AppData';
import { ChatFileContent, ChatItem } from 'shared/types/ChatMessage';
import { QuestionTemplateModelContent } from 'shared/types/QuestionTemplate';

export interface DataStoreServiceBase {
  getAppDataAsync(): Promise<AppData>;
  setAppDataAsync<T extends keyof AppData>(
    key: T,
    value: AppData[T],
  ): Promise<void>;
  setProjectId(path: string, projectId: string): Promise<void>;
  setProjectLastAddedLines(path: string, lastAddedLines: number): Promise<void>;
  setProjectSvn(projectPath: string, svnPath: string): Promise<void>;
  getActiveModelContent(): Promise<QuestionTemplateModelContent>;
  getChatList(): Promise<ChatItem[]>;
  getChat(name: string): Promise<ChatFileContent>;
  newChat(name: string): Promise<string>;
  saveChat(name: string, content: ChatFileContent): Promise<string>;
  deleteChat(name: string): Promise<void>;
  openChatListDir(): Promise<void>;
}
