import { SelectionData } from 'cmw-coder-subprocess';
import { extend, uid } from 'quasar';

import { NEW_LINE_REGEX } from 'shared/constants/common';
import {
  Commands,
  ExtensionToUiCommand,
  ExtensionToUiCommandExecMessage,
  ReceiveMessage,
  SendMessage,
  UiToExtensionCommand,
  UiToExtensionCommandExecParamsMap,
  UiToExtensionCommandExecResultMap,
} from 'shared/types/ExtensionMessage';
import { ExtensionConfig } from 'shared/types/ExtensionMessageDetails';
import { ServiceType } from 'shared/types/service';
import { NetworkZone } from 'shared/types/service/ConfigServiceTrait/types';
import { ChatInsertServerMessage } from 'shared/types/WsMessage';
import { useService } from 'utils/common';

export class AiAssistantIframe {
  private promiseMap = new Map<
    string,
    <T extends UiToExtensionCommand>(
      data: UiToExtensionCommandExecParamsMap[T],
    ) => Promise<UiToExtensionCommandExecResultMap[T]>
  >();
  private iframeWindow!: Window;
  private iframeUrl!: string;
  private refreshHandle!: () => void;
  private messageEventListener?: (event: MessageEvent) => void;
  private configService = useService(ServiceType.CONFIG);
  private dataStoreService = useService(ServiceType.DATA);
  private websocketService = useService(ServiceType.WEBSOCKET);

  init(iframeWindow: Window, url: string, refreshHandle: () => void) {
    console.log('init', iframeWindow, url);
    this.iframeWindow = iframeWindow;
    this.iframeUrl = url;
    this.refreshHandle = refreshHandle;
    this.messageEventListener = (event: MessageEvent) => {
      if (this.iframeUrl.includes(event.origin)) {
        this.receiveMessage(<never>event.data).catch();
      }
    };
    window.addEventListener('message', this.messageEventListener);
  }

  destroy() {
    if (this.messageEventListener) {
      window.removeEventListener('message', this.messageEventListener);
    }
  }

  private sendMessage<T extends Commands>(message: SendMessage<T>) {
    return new Promise<void>((rs) => {
      if (!message.id) {
        // message.id 不存在  ==> ui 执行消息
        const id = uid();
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
      resolveFn(message.content).catch();
      this.promiseMap.delete(message.id);
    } else {
      // promiseMap 不存在值 ===> 插件执行消息
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      const data = await this.execCommand(message.command, message.content);
      const sendMessage = extend({}, message) as unknown as SendMessage<T>;
      sendMessage.content = data;
      this.sendMessage(sendMessage).catch();
    }
  }

  async execCommand<T extends UiToExtensionCommand>(
    command: T,
    data: UiToExtensionCommandExecParamsMap[T],
  ): Promise<UiToExtensionCommandExecResultMap[T]> {
    console.log('execCommand', command, data);

    switch (command) {
      case UiToExtensionCommand.GET_CONFIG: {
        const config = await this.configService.getStore();
        const modelContent =
          await this.dataStoreService.getActiveModelContent();
        const projectData =
          await this.websocketService.getLastActivateProjectData();
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
          pluginBaseConfig: {
            appBuildTarget:
              config.networkZone === NetworkZone.Public ? 'NORMAL' : 'RED',
          },
          temperature: 0.7,
          activeChat: config.activeChat,
          useMultipleChat: config.useMultipleChat,
          subType: projectData?.id || 'NONE',
          useEnterSend: config.useEnterSend,
        };
        return extensionConfig as UiToExtensionCommandExecResultMap[T];
      }
      case UiToExtensionCommand.SET_CONFIG: {
        await this.configService.setConfigs(<ExtensionConfig>data);
        return undefined as UiToExtensionCommandExecResultMap[T];
      }
      case UiToExtensionCommand.GET_THEME: {
        const darkMode = await this.configService.get('darkMode');
        return (
          darkMode ? 'DARK' : 'LIGHT'
        ) as UiToExtensionCommandExecResultMap[T];
      }
      case UiToExtensionCommand.GET_TOKEN: {
        const { token, refreshToken } = await this.configService.getStore();
        return {
          token,
          refresh_token: refreshToken,
          token_type: 'bearer',
        } as UiToExtensionCommandExecResultMap[T];
      }
      case UiToExtensionCommand.SET_TOKEN: {
        const { token, refresh_token } =
          data as UiToExtensionCommandExecParamsMap[UiToExtensionCommand.SET_TOKEN];
        await this.configService.setConfigs({
          token,
          refreshToken: refresh_token,
        });
        return undefined as UiToExtensionCommandExecResultMap[T];
      }
      case UiToExtensionCommand.GET_QUESTION_TEMPLATE: {
        const modelContent =
          await this.dataStoreService.getActiveModelContent();
        return modelContent as UiToExtensionCommandExecResultMap[T];
      }
      case UiToExtensionCommand.GET_CHAT_LIST: {
        const res = await this.dataStoreService.getChatList();
        return res as UiToExtensionCommandExecResultMap[T];
      }
      case UiToExtensionCommand.GET_CHAT: {
        const res = await this.dataStoreService.getChat(data as string);
        return res as UiToExtensionCommandExecResultMap[T];
      }
      case UiToExtensionCommand.NEW_CHAT: {
        const name =
          data as UiToExtensionCommandExecParamsMap[UiToExtensionCommand.NEW_CHAT];
        await this.dataStoreService.newChat(name);
        return name as UiToExtensionCommandExecResultMap[T];
      }
      case UiToExtensionCommand.SAVE_CHAT: {
        const { name, content } =
          data as UiToExtensionCommandExecParamsMap[UiToExtensionCommand.SAVE_CHAT];
        await this.dataStoreService.saveChat(name, content);
        return name as UiToExtensionCommandExecResultMap[T];
      }
      case UiToExtensionCommand.DEL_CHAT: {
        const name =
          data as UiToExtensionCommandExecParamsMap[UiToExtensionCommand.DEL_CHAT];
        await this.dataStoreService.deleteChat(name);
        return undefined as UiToExtensionCommandExecResultMap[T];
      }
      case UiToExtensionCommand.OPEN_CHAT_LIST_DIR: {
        await this.dataStoreService.openChatListDir();
        return undefined as UiToExtensionCommandExecResultMap[T];
      }
      case UiToExtensionCommand.REFRESH_WEB_UI: {
        console.log('refresh web ui', this.iframeWindow);
        this.refreshHandle();
        return undefined as UiToExtensionCommandExecResultMap[T];
      }
      case UiToExtensionCommand.COPY_CODE: {
        const code =
          data as UiToExtensionCommandExecParamsMap[UiToExtensionCommand.COPY_CODE];
        await navigator.clipboard.writeText(code);
        return undefined as UiToExtensionCommandExecResultMap[T];
      }
      case UiToExtensionCommand.INSERT_CODE: {
        const code =
          data as UiToExtensionCommandExecParamsMap[UiToExtensionCommand.INSERT_CODE];
        this.websocketService.send(
          JSON.stringify(
            new ChatInsertServerMessage({
              result: 'success',
              content: code.replace(NEW_LINE_REGEX, '\n'),
            }),
          ),
        );
        return undefined as UiToExtensionCommandExecResultMap[T];
      }
      default:
        break;
    }
    throw new Error('Unknown command');
  }

  async customQuestion(selectionData: SelectionData) {
    const message = {
      command: ExtensionToUiCommand.CUSTOM_QUESTION,
      content: {
        code: selectionData.content,
        language: 'c',
        file: selectionData.file,
        position: [
          selectionData.range.begin.line,
          selectionData.range.end.line,
          0,
          0,
        ],
      },
    } as ExtensionToUiCommandExecMessage<ExtensionToUiCommand.CUSTOM_QUESTION>;
    await this.sendMessage(message);
  }
}

const aiAssistantIframe = new AiAssistantIframe();

export default aiAssistantIframe;
