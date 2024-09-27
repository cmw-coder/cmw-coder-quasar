export interface StatisticsServiceTrait {
  completionUpdatePromptConstructTime: (
    actionId: string,
    model: string,
    templateName: string,
  ) => void;
  completionUpdateRelativeDefinitionsTime: (actionId: string) => void;
  completionUpdateRagCodeTime: (actionId: string) => void;
  completionUpdateRequestEndTime: (actionId: string) => void;
  completionUpdateSimilarSnippetsTime: (actionId: string) => void;
}
