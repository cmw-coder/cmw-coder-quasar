import { uid } from 'quasar';

import { useService } from 'utils/common';
import {
  IframeMessage_Receive,
  IframeMessage_Send,
} from 'shared/types/ExtensionMessage';
import { ServiceType } from 'shared/types/service';

export class AiAssistantIframe {
  private promiseMap = new Map<string, (data: never) => void>();
  private iframeWindow!: Window;
  private iframeUrl!: string;

  init(iframeWindow: Window, url: string) {
    console.log('init', iframeWindow, url);
    this.iframeWindow = iframeWindow;
    this.iframeUrl = url;
    window.addEventListener('message', (event) => {
      if (this.iframeUrl.includes(event.origin)) {
        this.receiveMessage(event.data);
      }
    });
  }

  private sendMessage(message: IframeMessage_Send) {
    return new Promise<never>((rs) => {
      if (!message.id) {
        // message.id 不存在  ==> web 执行消息
        const id = uid();
        this.iframeWindow.postMessage(
          {
            ...message,
            id,
          },
          this.iframeUrl,
        );
      } else {
        // message.id 存在  ==> web 回馈消息
        this.iframeWindow.postMessage(message, this.iframeUrl);
        rs(<never>'');
      }
    });
  }

  private async receiveMessage(message: IframeMessage_Receive) {
    const resolveFn = this.promiseMap.get(message.id);
    if (resolveFn) {
      // promiseMap 存在值 ===> 插件回馈消息
      resolveFn(message.content);
      this.promiseMap.delete(message.id);
    } else {
      // promiseMap 不存在值 ===> 插件执行消息
      const data = await this.execCommand(message);
      this.sendMessage({
        ...message,
        content: data,
      });
    }
  }

  async execCommand(data: IframeMessage_Receive): Promise<never> {
    console.log('execCommand', data);
    const configService = useService(ServiceType.CONFIG);
    const dataStoreService = useService(ServiceType.DATA_STORE);
    if (data.command === 'GET_CONFIG') {
      const config = configService.getConfigs();
      const modelContent = await dataStoreService.getActiveModelContent();
      return <never>{
        appType: 'SI',
        serverUrl: config.baseServerUrl,
        modelKey: config.activeModelKey,
        template: config.activeTemplate,
        model: config.activeModel,
        modelName: modelContent.config.displayName,
        userInfo: {
          account: config.username,
        },
        embedding: {
          id: undefined,
          name: '无',
          code: undefined,
          embeddingModel: undefined,
          version: undefined,
          apiKey: undefined,
        },
        stream: '1',
        embeddingParams: {
          requestLlmType: '0',
          multipleChatNum: '2',
          topK: 3,
          useLocalQuestionTemplate: false,
        },
        pluginBaseConfig: undefined,
        temperature: 0.7,
        activeChat: config.activeChat,
        useMultipleChat: true,
        subType: '0',
        useEnterSend: false,
      };
    } else if (data.command === 'GET_THEME') {
      return <never>'DARK';
    }
    return <never>undefined;
  }
}

const aiAssistantIframe = new AiAssistantIframe();

export default aiAssistantIframe;
