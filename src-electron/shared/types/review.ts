export interface Reference {
  content: string;
  depth: number;
  name: string;
  type: string;
}

export interface reviewRequestParams {
  question: string;
  productLine: string;
  profileModel: string;
  templateName: string;
  model?: string;
  language?: string;
  maxTokens?: number;
  temperature?: number;
  topK?: number;
  stop?: string[];
  best_of?: number;
  do_sample?: boolean;
  top_p?: number;
  repetition_penalty?: number;
  subType?: string;
  suffix?: string;
  plugin?: string;

  references: Reference[];
  target: {
    block: string;
    snippet: string;
  };
}
