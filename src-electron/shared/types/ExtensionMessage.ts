import { ExtensionConfig } from 'shared/types/ExtensionMessageDetails';

export enum UiToExtensionCommand {
  GET_CONFIG = 'GET_CONFIG',
  SET_CONFIG = 'SET_CONFIG',
  GET_THEME = 'GET_THEME',
  // GET_STORAGE = 'GET_STORAGE',
  // GET_TOKEN = 'GET_TOKEN',
  // GET_QUESTION_TEMPLATE = 'GET_QUESTION_TEMPLATE',
  // SET_TOKEN = 'SET_TOKEN',
  // INSERT_CODE = 'INSERT_CODE',
  // COPY_CODE = 'COPY_CODE',
  // GET_CHAT_LIST = 'GET_CHAT_LIST',
  // GET_CHAT = 'GET_CHAT',
  // NEW_CHAT = 'NEW_CHAT',
  // SAVE_CHAT = 'SAVE_CHAT',
  // DEL_CHAT = 'DEL_CHAT',
  // OPEN_CHAT_LIST_DIR = 'OPEN_CHAT_LIST_DIR',
  // REFRESH_WEB_UI = 'REFRESH_WEB_UI',
}

export interface UiToExtensionCommandExecParamsMap {
  [UiToExtensionCommand.GET_CONFIG]: string;
  [UiToExtensionCommand.SET_CONFIG]: ExtensionConfig;
  [UiToExtensionCommand.GET_THEME]: void;
  // [UiToExtensionCommand.GET_STORAGE]: void;
  // [UiToExtensionCommand.SET_TOKEN]: string;
  // [UiToExtensionCommand.GET_TOKEN]: void;
  // [UiToExtensionCommand.GET_QUESTION_TEMPLATE]: void;
  // [UiToExtensionCommand.INSERT_CODE]: string;
  // [UiToExtensionCommand.COPY_CODE]: string;
  // [UiToExtensionCommand.GET_CHAT_LIST]: void;
  // [UiToExtensionCommand.GET_CHAT]: void;
  // [UiToExtensionCommand.NEW_CHAT]: void;
  // [UiToExtensionCommand.SAVE_CHAT]: void;
  // [UiToExtensionCommand.DEL_CHAT]: void;
  // [UiToExtensionCommand.OPEN_CHAT_LIST_DIR]: void;
  // [UiToExtensionCommand.REFRESH_WEB_UI]: void;
}

export interface UiToExtensionCommandExecResultMap {
  [UiToExtensionCommand.GET_CONFIG]: ExtensionConfig;
  [UiToExtensionCommand.SET_CONFIG]: string;
  [UiToExtensionCommand.GET_THEME]: void;
  // [UiToExtensionCommand.GET_STORAGE]: void;
  // [UiToExtensionCommand.SET_TOKEN]: string;
  // [UiToExtensionCommand.GET_TOKEN]: void;
  // [UiToExtensionCommand.GET_QUESTION_TEMPLATE]: void;
  // [UiToExtensionCommand.INSERT_CODE]: string;
  // [UiToExtensionCommand.COPY_CODE]: string;
  // [UiToExtensionCommand.GET_CHAT_LIST]: void;
  // [UiToExtensionCommand.GET_CHAT]: void;
  // [UiToExtensionCommand.NEW_CHAT]: void;
  // [UiToExtensionCommand.SAVE_CHAT]: void;
  // [UiToExtensionCommand.DEL_CHAT]: void;
  // [UiToExtensionCommand.OPEN_CHAT_LIST_DIR]: void;
  // [UiToExtensionCommand.REFRESH_WEB_UI]: void;
}

export interface UiToExtensionCommandExecMessage<
  T extends UiToExtensionCommand,
> {
  id: string;
  command: T;
  content: UiToExtensionCommandExecParamsMap[T];
}

export interface UiToExtensionCommandExecResultMessage<
  T extends UiToExtensionCommand,
> {
  id: string;
  command: T;
  content: UiToExtensionCommandExecResultMap[T];
}

export enum ExtensionToUiCommand {
  QUESTION = 'QUESTION',
}

export interface ExtensionToUiCommandExecMap {
  [ExtensionToUiCommand.QUESTION]: string;
}

export interface ExtensionToUiCommandExecResultMap {
  [ExtensionToUiCommand.QUESTION]: string;
}

export interface ExtensionToUiCommandExecMessage<
  T extends ExtensionToUiCommand,
> {
  id: undefined;
  command: T;
  content: ExtensionToUiCommandExecMap[T];
}

export interface ExtensionToUiCommandExecResultMessage<
  T extends ExtensionToUiCommand,
> {
  id: string;
  command: T;
  content: ExtensionToUiCommandExecResultMap[T];
}

export type Commands = UiToExtensionCommand & ExtensionToUiCommand;

export type SendMessage<T extends Commands> = T extends ExtensionToUiCommand
  ? ExtensionToUiCommandExecMessage<T>
  : UiToExtensionCommandExecResultMessage<T>;

export type ReceiveMessage<T extends Commands> = T extends UiToExtensionCommand
  ? UiToExtensionCommandExecMessage<T>
  : ExtensionToUiCommandExecResultMessage<T>;
