export type QuestionTemplate = Record<string, string>;

export interface QuestionConfig {
  modelKey: string;
  displayName: string;
}

export interface PromptTemplate {
  common: string;
  commonMulti: string;
  commonInline: string;
  embedding: string;
}

export type PromptTemplateMap = Record<string, string>;

export interface QuestionTemplateModelContent {
  template: QuestionTemplate;
  config: QuestionConfig;
  prompt: Record<
    string,
    {
      other: PromptTemplate;
    }
  >;
}

export type QuestionTemplateFile = Record<string, QuestionTemplateModelContent>;
