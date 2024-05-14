import { v4 as uuidv4 } from 'uuid';
import { useService } from 'utils/common';
import { ServiceType } from 'shared/services';
import {
  Commands,
  ReceiveMessage,
  SendMessage,
  UiToExtensionCommand,
  UiToExtensionCommandExecParamsMap,
  UiToExtensionCommandExecResultMap,
} from 'shared/types/ExtensionMessage';
import { ExtensionConfig } from 'shared/types/ExtensionMessageDetails';
import { deepClone } from 'shared/utils';

export class AiAssistantIframe {
  private promiseMap = new Map<
    string,
    <T extends UiToExtensionCommand>(
      data: UiToExtensionCommandExecParamsMap[T],
    ) => Promise<UiToExtensionCommandExecResultMap[T]>
  >();
  private iframeWindow!: Window;
  private iframeUrl!: string;

  init(iframeWindow: Window, url: string) {
    console.log('init', iframeWindow, url);
    this.iframeWindow = iframeWindow;
    this.iframeUrl = url;
    window.addEventListener('message', (event) => {
      if (this.iframeUrl.includes(event.origin)) {
        this.receiveMessage(<never>event.data);
      }
    });
  }

  private sendMessage<T extends Commands>(message: SendMessage<T>) {
    return new Promise<void>((rs) => {
      if (!message.id) {
        // message.id 不存在  ==> ui 执行消息
        const id = uuidv4();
        this.iframeWindow.postMessage(
          {
            ...message,
            id,
          },
          this.iframeUrl,
        );
      } else {
        // message.id 存在  ==> extension 执行回馈消息
        this.iframeWindow.postMessage(message, this.iframeUrl);
        rs();
      }
    });
  }

  private async receiveMessage<T extends Commands>(message: ReceiveMessage<T>) {
    const resolveFn = this.promiseMap.get(message.id);
    if (resolveFn) {
      // promiseMap 存在值 ===> 插件回馈消息
      resolveFn(message.content);
      this.promiseMap.delete(message.id);
    } else {
      // promiseMap 不存在值 ===> 插件执行消息
      const data = await this.execCommand(message.command, message.content);
      const sendMessage = deepClone(message) as unknown as SendMessage<T>;
      sendMessage.content = data;
      this.sendMessage(sendMessage);
    }
  }

  async execCommand<T extends UiToExtensionCommand>(
    command: T,
    data: UiToExtensionCommandExecParamsMap[T],
  ): Promise<UiToExtensionCommandExecResultMap[T]> {
    console.log('execCommand', command, data);
    const configService = useService(ServiceType.CONFIG);
    const dataStoreService = useService(ServiceType.DATA_STORE);
    switch (command) {
      case UiToExtensionCommand.GET_CONFIG: {
        const config = await configService.getConfigs();
        const modelContent = await dataStoreService.getActiveModelContent();
        const extensionConfig: ExtensionConfig = {
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
        return extensionConfig as UiToExtensionCommandExecResultMap[T];
      }
      case UiToExtensionCommand.SET_CONFIG: {
        await configService.setConfigs(<ExtensionConfig>data);
        return undefined as UiToExtensionCommandExecResultMap[T];
      }
      case UiToExtensionCommand.GET_THEME: {
        return 'DARK' as UiToExtensionCommandExecResultMap[T];
      }
      case UiToExtensionCommand.GET_TOKEN: {
        const { token, refreshToken } = await configService.getConfigs();
        return {
          token,
          refresh_token: refreshToken,
          token_type: 'bearer',
        } as UiToExtensionCommandExecResultMap[T];
      }
      case UiToExtensionCommand.SET_TOKEN: {
        const { token, refresh_token } =
          data as UiToExtensionCommandExecParamsMap[UiToExtensionCommand.SET_TOKEN];
        await configService.setConfigs({ token, refreshToken: refresh_token });
        return undefined as UiToExtensionCommandExecResultMap[T];
      }
      case UiToExtensionCommand.GET_QUESTION_TEMPLATE: {
        const modelContent = await dataStoreService.getActiveModelContent();
        return modelContent as UiToExtensionCommandExecResultMap[T];
      }
      case UiToExtensionCommand.GET_CHAT_LIST: {
        const res = await dataStoreService.getChatList();
        return res as UiToExtensionCommandExecResultMap[T];
      }
      case UiToExtensionCommand.GET_CHAT: {
        const res = await dataStoreService.getChat(data as string);
        return res as UiToExtensionCommandExecResultMap[T];
      }
      case UiToExtensionCommand.NEW_CHAT: {
        const name =
          data as UiToExtensionCommandExecParamsMap[UiToExtensionCommand.NEW_CHAT];
        await dataStoreService.newChat(name);
        return name as UiToExtensionCommandExecResultMap[T];
      }
      case UiToExtensionCommand.SAVE_CHAT: {
        const { name, content } =
          data as UiToExtensionCommandExecParamsMap[UiToExtensionCommand.SAVE_CHAT];
        await dataStoreService.saveChat(name, content);
        return name as UiToExtensionCommandExecResultMap[T];
      }
      case UiToExtensionCommand.DEL_CHAT: {
        const name =
          data as UiToExtensionCommandExecParamsMap[UiToExtensionCommand.DEL_CHAT];
        await dataStoreService.deleteChat(name);
        return undefined as UiToExtensionCommandExecResultMap[T];
      }
      case UiToExtensionCommand.OPEN_CHAT_LIST_DIR: {
        await dataStoreService.openChatListDir();
        return undefined as UiToExtensionCommandExecResultMap[T];
      }
      default:
        break;
    }
    throw new Error('Unknown command');
  }
}

const aiAssistantIframe = new AiAssistantIframe();

export default aiAssistantIframe;
