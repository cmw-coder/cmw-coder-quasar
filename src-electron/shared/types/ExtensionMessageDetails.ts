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
  pluginBaseConfig: PluginBaseConfig;
  temperature: number;
  activeChat: string;
  useMultipleChat: boolean;
  subType: string;
  useEnterSend: boolean;
}

export type AppBuildTarget = 'NORMAL' | 'RED' | 'HUAZHI';

interface PluginBaseConfig {
  appBuildTarget: AppBuildTarget;
}
