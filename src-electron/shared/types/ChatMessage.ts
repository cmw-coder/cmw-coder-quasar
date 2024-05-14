export interface MessageItem {
  id: string;
  question: QuestionItem;
  answer: AnswerItem;
}

export interface ChatFileContent {
  createTime: number;
  messageList: MessageItem[];
}

export interface ChatItem {
  name: string;
  filepath: string;
}

export type QuestionFromType = 'input' | 'code' | 'terminal' | 'output';

export type QuestionType = 'CodeAddComment' | 'CodeExplanation';

export interface QuestionItem {
  time: number;
  content: string;
  from: QuestionFromType;
  type: QuestionType;
  sessionId?: string;
  language?: string;
  codePosition?: {
    file: string;
    position: number[];
  };
}

export interface AnswerItem {
  sessionId?: string;
  modelName: string;
  productLine: string;
  time: number;
  content: string;
  generating: boolean;
}
