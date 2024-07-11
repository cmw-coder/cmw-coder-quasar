import { ExtensionConfig } from 'shared/types/ExtensionMessageDetails';
import { ChatFileContent, ChatItem } from 'shared/types/ChatMessage';
import { type ModelConfig } from 'shared/types/service/DataStoreServiceTrait/types';

export enum UiToExtensionCommand {
  GET_CONFIG = 'GET_CONFIG',
  SET_CONFIG = 'SET_CONFIG',
  GET_THEME = 'GET_THEME',
  GET_TOKEN = 'GET_TOKEN',
  SET_TOKEN = 'SET_TOKEN',
  GET_QUESTION_TEMPLATE = 'GET_QUESTION_TEMPLATE',
  GET_CHAT_LIST = 'GET_CHAT_LIST',
  GET_CHAT = 'GET_CHAT',
  NEW_CHAT = 'NEW_CHAT',
  SAVE_CHAT = 'SAVE_CHAT',
  DEL_CHAT = 'DEL_CHAT',
  OPEN_CHAT_LIST_DIR = 'OPEN_CHAT_LIST_DIR',
  REFRESH_WEB_UI = 'REFRESH_WEB_UI',
  COPY_CODE = 'COPY_CODE',
  INSERT_CODE = 'INSERT_CODE',
}

export interface UiToExtensionCommandExecParamsMap {
  [UiToExtensionCommand.GET_CONFIG]: string;
  [UiToExtensionCommand.SET_CONFIG]: ExtensionConfig;
  [UiToExtensionCommand.GET_THEME]: undefined;
  [UiToExtensionCommand.SET_TOKEN]: {
    token: string;
    refresh_token: string;
    token_type: 'bearer';
  };
  [UiToExtensionCommand.GET_TOKEN]: undefined;
  [UiToExtensionCommand.GET_QUESTION_TEMPLATE]: undefined;
  [UiToExtensionCommand.GET_CHAT_LIST]: undefined;
  [UiToExtensionCommand.GET_CHAT]: undefined;
  [UiToExtensionCommand.NEW_CHAT]: string;
  [UiToExtensionCommand.SAVE_CHAT]: {
    name: string;
    content: ChatFileContent;
  };
  [UiToExtensionCommand.DEL_CHAT]: string;
  [UiToExtensionCommand.OPEN_CHAT_LIST_DIR]: undefined;
  [UiToExtensionCommand.REFRESH_WEB_UI]: undefined;
  [UiToExtensionCommand.COPY_CODE]: string;
  [UiToExtensionCommand.INSERT_CODE]: string;
}

export interface UiToExtensionCommandExecResultMap {
  [UiToExtensionCommand.GET_CONFIG]: ExtensionConfig;
  [UiToExtensionCommand.SET_CONFIG]: undefined;
  [UiToExtensionCommand.GET_THEME]: string;
  [UiToExtensionCommand.SET_TOKEN]: undefined;
  [UiToExtensionCommand.GET_TOKEN]: {
    token: string;
    refresh_token: string;
    token_type: 'bearer';
  };
  [UiToExtensionCommand.GET_QUESTION_TEMPLATE]: ModelConfig;
  [UiToExtensionCommand.GET_CHAT_LIST]: ChatItem[];
  [UiToExtensionCommand.GET_CHAT]: ChatFileContent;
  [UiToExtensionCommand.NEW_CHAT]: string;
  [UiToExtensionCommand.SAVE_CHAT]: string;
  [UiToExtensionCommand.DEL_CHAT]: undefined;
  [UiToExtensionCommand.OPEN_CHAT_LIST_DIR]: undefined;
  [UiToExtensionCommand.REFRESH_WEB_UI]: undefined;
  [UiToExtensionCommand.COPY_CODE]: undefined;
  [UiToExtensionCommand.INSERT_CODE]: undefined;
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
  CUSTOM_QUESTION = 'CUSTOM_QUESTION',
}

export interface ExtensionToUiCommandExecMap {
  [ExtensionToUiCommand.QUESTION]: string;
  [ExtensionToUiCommand.CUSTOM_QUESTION]: {
    code: string;
    language: string;
    file: string;
    position: number[];
  };
}

export interface ExtensionToUiCommandExecResultMap {
  [ExtensionToUiCommand.QUESTION]: string;
  [ExtensionToUiCommand.CUSTOM_QUESTION]: undefined;
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

export type Commands = ExtensionToUiCommand | UiToExtensionCommand;

export type SendMessage<T extends Commands> = T extends ExtensionToUiCommand
  ? ExtensionToUiCommandExecMessage<T>
  : T extends UiToExtensionCommand
    ? UiToExtensionCommandExecResultMessage<T>
    : never;

export type ReceiveMessage<T extends Commands> = T extends UiToExtensionCommand
  ? UiToExtensionCommandExecMessage<T>
  : T extends ExtensionToUiCommand
    ? ExtensionToUiCommandExecResultMessage<T>
    : never;
