interface HistoryItem {
  role: 'assistant' | 'user';
  content: string;
}

export interface QuestionParams {
  question: string;
  productLine: string;
  profileModel: string;
  templateName: string;
  historyList?: HistoryItem[];
  model?: string;
  language?: string;
  maxTokens?: number;
  topK?: number;
  stop?: string[];
  best_of?: number;
  do_sample?: boolean;
  top_p?: number;
  repetition_penalty?: number;
  subType?: string;
  suffix?: string;
}

export interface Answer {
  text: string;
  code: string;
  sessionId: number;
  finishReason: string;
}
