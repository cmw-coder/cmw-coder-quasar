export interface ExtensionConfig {
  appType: 'SI';
  serverUrl: string;
  modelKey: string;
  template: string;
  model: string;
  modelName: string;
  userInfo: {
    account: string;
  };
  embedding: {
    id?: undefined;
    name: string;
    code?: string;
    embeddingModel?: string;
    version?: string;
    apiKey?: string;
  };
  stream: '1' | '0';
  embeddingParams: {
    requestLlmType: string;
    multipleChatNum: string;
    topK: number;
    useLocalQuestionTemplate: boolean;
  };
  pluginBaseConfig?: string;
  temperature: number;
  activeChat: string;
  useMultipleChat: boolean;
  subType: string;
  useEnterSend: boolean;
}
