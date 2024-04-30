import ElectronStore from 'electron-store';
import { inject, injectable } from 'inversify';
import { release } from 'os';

import { DataStore } from 'main/stores/data';
import { DataStoreType } from 'main/stores/data/types';
import { registerAction } from 'preload/types/ActionApi';
import { DataStoreServiceBase } from 'shared/services/types/DataStoreServiceBase';
import { ActionType } from 'shared/types/ActionMessage';
import { AppData, WindowData, defaultAppData } from 'shared/types/AppData';
import { deepClone } from 'shared/utils';
import { WindowType } from 'shared/types/WindowType';
import {
  api_getProductLineQuestionTemplateFile,
  api_getUserTemplateList,
} from 'main/request/api';
import { ConfigService } from 'service/entities/ConfigService';
import { ServiceType } from 'shared/services';
import { QuestionTemplateFile } from 'shared/types/QuestionTemplate';
import Logger from 'electron-log';

const defaultStoreData = deepClone(defaultAppData);

defaultStoreData.compatibility.transparentFallback =
  parseInt(release().split('.')[0]) < 10;

@injectable()
export class DataStoreService implements DataStoreServiceBase {
  /**
   * @deprecated
   */
  dataStore = new DataStore();

  private appDataStore = new ElectronStore<AppData>({
    name: 'appData',
    defaults: defaultStoreData,
  });

  serverTemplateList: string[] = [];
  serverTemplate?: QuestionTemplateFile;

  constructor(
    @inject(ServiceType.CONFIG)
    private _configService: ConfigService,
  ) {
    registerAction(
      ActionType.DataStoreSave,
      `main.stores.${ActionType.DataStoreSave}`,
      (data) => {
        this.dataStore.store = data;
      },
    );
  }

  async save(data: Partial<DataStoreType>) {
    this.dataStore.store = data;
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

  getAppdata() {
    return this.appDataStore.store;
  }

  async refreshServerTemplateList() {
    try {
      const username = await this._configService.getConfig('username');
      this.serverTemplateList = await api_getUserTemplateList(username);
      console.log('serverTemplateList', this.serverTemplateList);
    } catch (error) {
      Logger.error('refreshServerTemplateList error', error);
    }
  }

  async refreshTemplate() {
    try {
      const { activeTemplate } = await this._configService.getConfigs();
      this.serverTemplate =
        await api_getProductLineQuestionTemplateFile(activeTemplate);
    } catch (error) {
      Logger.error('refreshTemplate error', error);
    }
  }

  async getActiveModelContent() {
    if (this.serverTemplateList.length === 0) {
      await this.refreshServerTemplateList();
    }
    if (this.serverTemplateList.length === 0) {
      throw new Error('serverTemplateList is empty');
    }
    let { activeTemplate, activeModel, activeModelKey } =
      await this._configService.getConfigs();

    if (!this.serverTemplateList.includes(activeTemplate)) {
      // 本地选择模板已不在服务器模板列表中
      activeTemplate = this.serverTemplateList[0];
      this.serverTemplate = undefined;
      await this._configService.setConfig('activeTemplate', activeTemplate);
    }
    if (!this.serverTemplate) {
      // 缓存模板内容不存在
      await this.refreshTemplate();
    }
    if (!this.serverTemplate) {
      throw new Error('serverTemplate is empty');
    }
    const models = Object.keys(this.serverTemplate);
    if (!models.includes(activeModel)) {
      // 本地选择模型已不在服务器模型列表中
      activeModel = models[0];
      activeModelKey = this.serverTemplate[activeModel].config.modelKey;
      await this._configService.setConfig('activeModel', activeModel);
      await this._configService.setConfig('activeModelKey', activeModelKey);
    }
    return this.serverTemplate[activeModel];
  }
}
