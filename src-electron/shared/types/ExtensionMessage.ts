export type ReceiveCommand =
  | 'GET_CONFIG'
  | 'SET_CONFIG'
  | 'GET_STORAGE'
  | 'GET_THEME'
  | 'GET_TOKEN'
  | 'GET_QUESTION_TEMPLATE'
  | 'SET_TOKEN'
  | 'INSERT_CODE'
  | 'COPY_CODE'
  | 'GET_CHAT_LIST'
  | 'GET_CHAT'
  | 'NEW_CHAT'
  | 'SAVE_CHAT'
  | 'DEL_CHAT'
  | 'OPEN_CHAT_LIST_DIR'
  | 'REFRESH_WEB_UI';

export interface IframeMessage_Receive {
  id: string;
  command: ReceiveCommand;
  content: never;
}

export interface IframeMessage_Send {
  id?: string;
  command: string;
  content: never;
}
