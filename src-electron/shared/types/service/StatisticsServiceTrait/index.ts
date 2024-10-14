export interface StatisticsServiceTrait {
  completionUpdateCalledFunctionIdentifiersTime: (actionId: string) => void;
  completionUpdateGlobalsTime: (actionId: string) => void;
  completionUpdateIncludesTime: (actionId: string) => void;
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
