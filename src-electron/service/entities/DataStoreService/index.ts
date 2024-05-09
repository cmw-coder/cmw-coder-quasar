import ElectronStore from 'electron-store';
import { inject, injectable } from 'inversify';
import { release } from 'os';

import { DataStore } from 'main/stores/data';
import { DataStoreType } from 'main/stores/data/types';
import { registerAction } from 'preload/types/ActionApi';
import { DataStoreServiceBase } from 'shared/services/types/DataStoreServiceBase';
import { ActionType } from 'shared/types/ActionMessage';
import {
  AppData,
  WindowData,
  defaultAppData,
  defaultQuestionTemplateModelContent,
} from 'shared/types/AppData';
import { deepClone } from 'shared/utils';
import { WindowType } from 'shared/types/WindowType';
import {
  api_getProductLineQuestionTemplateFile,
  api_getUserTemplateList,
} from 'main/request/api';
import { ConfigService } from 'service/entities/ConfigService';
import { ServiceType } from 'shared/services';
import {
  QuestionTemplateFile,
  QuestionTemplateModelContent,
} from 'shared/types/QuestionTemplate';
import Logger from 'electron-log';
import { getRevision } from 'main/utils/svn';

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

  private serverTemplateList: string[] = [];
  private serverTemplate?: QuestionTemplateFile;
  activeModelContent: QuestionTemplateModelContent = deepClone(
    defaultQuestionTemplateModelContent,
  );

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

  /**
   * @deprecated
   */
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
    this.activeModelContent = this.serverTemplate[activeModel];
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
    if (
      project[projectPath] &&
      !project[projectPath].svn.find(({ directory }) => directory === svnPath)
    ) {
      project[projectPath].svn.push({
        directory: svnPath,
        revision: await getRevision(svnPath),
      });
      this.appDataStore.set('project', project);
    }
  }
}
