import log from 'electron-log/main';
import ElectronStore from 'electron-store';
import { inject, injectable } from 'inversify';
import { extend } from 'quasar';
import { release } from 'os';

import {
  api_getProductLineQuestionTemplateFile,
  api_getUserTemplateList,
} from 'main/request/api';
import { DataStoreBefore1_2_0 } from 'main/stores/data';
import { DataStoreServiceTrait } from 'shared/types/service/DataStoreServiceTrait';
import { defaultModelConfig } from 'shared/types/service/DataStoreServiceTrait/constants';
import {
  AppData,
  defaultAppData,
  ModelConfig,
  ModelConfigMap,
  WindowData,
} from 'shared/types/service/DataStoreServiceTrait/types';
import { WindowType } from 'shared/types/WindowType';
import { ServiceType } from 'shared/types/service';
import { getRevision } from 'main/utils/svn';
import { ConfigService } from 'main/services/ConfigService';
import { ChatFileContent } from 'shared/types/ChatMessage';
import { LocalChatManager } from 'main/services/DataStoreService/LocalChatManager';

const defaultStoreData = extend<AppData>(true, {}, defaultAppData);

defaultStoreData.compatibility.transparentFallback =
  parseInt(release().split('.')[0]) < 10;

@injectable()
export class DataStoreService implements DataStoreServiceTrait {
  /**
   * @deprecated
   */
  dataStoreBefore1_2_0 = new DataStoreBefore1_2_0();

  private appDataStore = new ElectronStore<AppData>({
    name: 'appData',
    defaults: defaultStoreData,
    migrations: {
      '1.2.6': (store) => {
        log.info('Upgrading "appData" store to 1.2.6 ...');
        const appData = store.store;
        if (!appData.window[WindowType.SelectionTips]) {
          appData.window[WindowType.SelectionTips] =
            defaultAppData.window[WindowType.SelectionTips];
        }
        store.set('window', appData.window);
      },
      '1.2.8': (store) => {
        log.info('Upgrading "appData" store to 1.2.8 ...');
        const appData = store.store;
        if (!appData.project) {
          appData.project = {};
        } else {
          for (const key in appData.project) {
            appData.project[key].isAutoManaged = true;
          }
        }
        store.set('project', appData.project);
      },
    },
  });

  private serverTemplateList: string[] = [];
  private currentQuestionTemplateFile?: ModelConfigMap;
  activeModelContent: ModelConfig = extend<ModelConfig>(
    true,
    {},
    defaultModelConfig,
  );
  localChatManager = new LocalChatManager();

  constructor(
    @inject(ServiceType.CONFIG)
    private _configService: ConfigService,
  ) {
    // 定时重新获取模板内容
    setInterval(
      () => {
        this.scheduleJobUpdateActiveModelContent();
      },
      60 * 60 * 1000,
    );
  }

  async scheduleJobUpdateActiveModelContent() {
    try {
      log.info('DataStoreService.scheduleJob.updateActiveModelContent');
      let { activeModel, activeModelKey } =
        await this._configService.getConfigs();
      await this._updateCurrentQuestionTemplateFile();
      if (!this.currentQuestionTemplateFile) {
        return;
      }
      const models = Object.keys(this.currentQuestionTemplateFile);
      if (!models.includes(activeModel)) {
        // 本地选择模型已不在服务器模型列表中
        activeModel = models[0];
        activeModelKey =
          this.currentQuestionTemplateFile[activeModel].config.modelKey;
        await this._configService.setConfig('activeModel', activeModel);
        await this._configService.setConfig('activeModelKey', activeModelKey);
      }
      this.activeModelContent = this.currentQuestionTemplateFile[activeModel];
    } catch (e) {
      log.error('DataStoreService.scheduleJob.updateActiveModelContent', e);
    }
  }

  getWindowData(windowType: WindowType) {
    const windowData = this.appDataStore.get('window');
    return windowData[windowType];
  }

  saveWindowData(windowType: WindowType, data: WindowData) {
    const windowData = this.appDataStore.get('window');
    windowData[windowType] = data;
    this.appDataStore.set('window', windowData);
  }

  async getAppDataAsync() {
    return this.appDataStore.store;
  }

  async setAppDataAsync<T extends keyof AppData>(
    key: T,
    value: AppData[T],
  ): Promise<void> {
    this.appDataStore.set(key, value);
  }

  getAppdata() {
    return this.appDataStore.store;
  }

  setAppData<T extends keyof AppData>(key: T, value: AppData[T]) {
    this.appDataStore.set(key, value);
  }

  private async _updateCurrentQuestionTemplateFile() {
    try {
      const { activeTemplate } = await this._configService.getConfigs();
      this.currentQuestionTemplateFile =
        await api_getProductLineQuestionTemplateFile(activeTemplate);
    } catch (error) {
      log.error('DataStoreService._updateCurrentQuestionTemplateFile', error);
    }
  }

  async refreshServerTemplateList() {
    try {
      const username = await this._configService.getConfig('username');
      this.serverTemplateList = await api_getUserTemplateList(username);
      console.log('serverTemplateList', this.serverTemplateList);
    } catch (error) {
      log.error('refreshServerTemplateList error', error);
    }
  }

  async getActiveModelContent() {
    if (!this.serverTemplateList.length) {
      await this.refreshServerTemplateList();
      if (!this.serverTemplateList.length) {
        throw new Error('serverTemplateList is empty');
      }
    }

    let { activeTemplate, activeModel, activeModelKey } =
      await this._configService.getConfigs();

    if (!this.serverTemplateList.includes(activeTemplate)) {
      log.warn(
        'DataStoreService.getActiveModelContent',
        `Template '${activeTemplate}' is not valid on server anymore`,
      );
      activeTemplate = this.serverTemplateList[0];
      this.currentQuestionTemplateFile = undefined;
      await this._configService.setConfig('activeTemplate', activeTemplate);
    }
    if (!this.currentQuestionTemplateFile) {
      // 缓存模板内容不存在
      await this._updateCurrentQuestionTemplateFile();
      if (!this.currentQuestionTemplateFile) {
        throw new Error('serverTemplate is empty');
      }
    }
    const models = Object.keys(this.currentQuestionTemplateFile);
    if (!models.includes(activeModel)) {
      // 本地选择模型已不在服务器模型列表中
      activeModel = models[0];
      activeModelKey =
        this.currentQuestionTemplateFile[activeModel].config.modelKey;
      await this._configService.setConfig('activeModel', activeModel);
      await this._configService.setConfig('activeModelKey', activeModelKey);
    }
    this.activeModelContent = this.currentQuestionTemplateFile[activeModel];
    return this.activeModelContent;
  }

  async setProjectId(path: string, projectId: string) {
    const project = this.appDataStore.get('project');
    console.log('setProjectId', path, projectId, project);
    if (project[path]) {
      project[path].id = projectId;
    } else {
      project[path] = {
        id: projectId,
        isAutoManaged: true,
        lastAddedLines: 0,
        svn: [],
      };
    }
    this.appDataStore.set('project', project);
  }

  async setProjectLastAddedLines(path: string, lastAddedLines: number) {
    const project = this.appDataStore.get('project');
    if (project[path]) {
      project[path].lastAddedLines = lastAddedLines;
      this.appDataStore.set('project', project);
    }
  }

  async setProjectSvn(projectPath: string, svnPath: string) {
    const project = this.appDataStore.get('project');
    const projectData = project[projectPath];
    if (!projectData) {
      return;
    }
    if (!projectData.isAutoManaged) {
      return;
    }
    if (
      projectData &&
      !projectData.svn.find(({ directory }) => directory === svnPath)
    ) {
      projectData.svn.push({
        directory: svnPath,
        revision: await getRevision(svnPath),
      });
      this.appDataStore.set('project', project);
    }
  }

  async getChatList() {
    return this.localChatManager.getChatList();
  }

  async getChat(name: string) {
    return this.localChatManager.getChat(name);
  }

  async newChat(name: string) {
    return this.localChatManager.newChat(name);
  }

  async saveChat(name: string, content: ChatFileContent) {
    return this.localChatManager.saveChat(name, content);
  }

  async deleteChat(name: string) {
    return this.localChatManager.deleteChat(name);
  }

  async openChatListDir() {
    return this.localChatManager.openChatListDir();
  }
}
