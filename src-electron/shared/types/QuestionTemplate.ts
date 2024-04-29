export type QuestionTemplate = Record<string, string>;

export interface QuestionConfig {
  modelKey: string;
  displayName: string;
}

export type QuestionTemplateFile = Record<
  string,
  {
    template: QuestionTemplate;
    config: QuestionConfig;
  }
>;
