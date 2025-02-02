import log from 'electron-log/main';
import ElectronStore from 'electron-store';
import { inject, injectable } from 'inversify';
import { extend } from 'quasar';
import { release } from 'os';

import {
  api_getProductLineQuestionTemplateFile,
  api_getUserTemplateList,
} from 'main/request/api';
import { ConfigService } from 'main/services/ConfigService';
import { LocalBackupManager } from 'main/services/DataService/LocalBackupManager';
import { LocalChatManager } from 'main/services/DataService/LocalChatManager';
import { getRevision } from 'main/utils/svn';

import { ChatFileContent } from 'shared/types/ChatMessage';
import { ServiceType } from 'shared/types/service';
import { DataServiceTrait } from 'shared/types/service/DataServiceTrait';
import {
  DEFAULT_APP_DATA,
  DEFAULT_MODEL_CONFIG,
} from 'shared/types/service/DataServiceTrait/constants';
import {
  AppData,
  ModelConfig,
  ModelConfigMap,
  ProjectData,
  WindowData,
} from 'shared/types/service/DataServiceTrait/types';
import { WindowType } from 'shared/types/service/WindowServiceTrait/types';

const defaultStoreData = extend<AppData>(true, {}, DEFAULT_APP_DATA);

defaultStoreData.compatibility.transparentFallback =
  parseInt(release().split('.')[0]) < 10;

@injectable()
export class DataService implements DataServiceTrait {
  private _activeModelContent: ModelConfig = extend<ModelConfig>(
    true,
    {},
    DEFAULT_MODEL_CONFIG,
  );
  private _appDataStore = new ElectronStore<AppData>({
    name: 'appData',
    defaults: defaultStoreData,
    migrations: {
      '1.2.6': (store) => {
        log.info('Upgrading "appData" store to 1.2.6 ...');
        const appData = store.store;
        if (!appData.window[WindowType.SelectionTips]) {
          appData.window[WindowType.SelectionTips] =
            DEFAULT_APP_DATA.window[WindowType.SelectionTips];
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
      '1.5.2': (store) => {
        log.info('Upgrading "appData" store to 1.5.2 ...');
        const appData = store.store;
        if (!appData.backup) {
          appData.backup = DEFAULT_APP_DATA.backup;
        }
        store.set('backup', appData.backup);
      },
    },
  });
  private _currentQuestionTemplateFile?: ModelConfigMap;
  private _localBackupManager = new LocalBackupManager();
  private _localChatManager = new LocalChatManager();
  private _serverTemplateList: string[] = [];

  constructor(
    @inject(ServiceType.CONFIG)
    private _configService: ConfigService,
  ) {
    // 定时重新获取模板内容
    setInterval(
      () => {
        this.scheduleJobUpdateActiveModelContent().catch();
      },
      60 * 60 * 1000,
    );
  }

  async scheduleJobUpdateActiveModelContent() {
    try {
      log.info('DataStoreService.scheduleJob.updateActiveModelContent');
      let { activeModel, activeModelKey } = this._configService.store.store;
      await this._updateCurrentQuestionTemplateFile();
      if (!this._currentQuestionTemplateFile) {
        return;
      }
      const models = Object.keys(this._currentQuestionTemplateFile);
      if (!models.includes(activeModel)) {
        // 本地选择模型已不在服务器模型列表中
        activeModel = models[0];
        activeModelKey =
          this._currentQuestionTemplateFile[activeModel].config.modelKey;
        this._configService.store.set('activeModel', activeModel);
        this._configService.store.set('activeModelKey', activeModelKey);
      }
      this._activeModelContent = this._currentQuestionTemplateFile[activeModel];
    } catch (e) {
      log.error('DataStoreService.scheduleJob.updateActiveModelContent', e);
    }
  }

  getWindowData(windowType: WindowType) {
    const windowData = this._appDataStore.get('window');
    return windowData[windowType];
  }

  saveWindowData(windowType: WindowType, data: WindowData) {
    const windowData = this._appDataStore.get('window');
    windowData[windowType] = data;
    this._appDataStore.set('window', windowData);
  }

  async getStoreAsync() {
    return this._appDataStore.store;
  }

  async setStoreAsync<T extends keyof AppData>(
    key: T,
    value: AppData[T],
  ): Promise<void> {
    this._appDataStore.set(key, value);
  }

  getStoreSync() {
    return this._appDataStore.store;
  }

  getProjectData(project: string): ProjectData | undefined {
    return this._appDataStore.get('project')[project];
  }

  private async _updateCurrentQuestionTemplateFile() {
    try {
      const { activeTemplate } = await this._configService.getStore();
      this._currentQuestionTemplateFile =
        await api_getProductLineQuestionTemplateFile(activeTemplate);
    } catch (error) {
      log.error('DataStoreService._updateCurrentQuestionTemplateFile', error);
    }
  }

  async refreshServerTemplateList() {
    try {
      const username = await this._configService.get('username');
      this._serverTemplateList = await api_getUserTemplateList(username);
      console.log('_serverTemplateList', this._serverTemplateList);
    } catch (error) {
      log.error('refreshServerTemplateList error', error);
    }
  }

  async getActiveModelContent() {
    if (!this._serverTemplateList.length) {
      await this.refreshServerTemplateList();
      if (!this._serverTemplateList.length) {
        throw new Error('_serverTemplateList is empty');
      }
    }

    let { activeTemplate, activeModel, activeModelKey } =
      await this._configService.getStore();

    if (!this._serverTemplateList.includes(activeTemplate)) {
      log.warn(
        'DataStoreService.getActiveModelContent',
        `Template '${activeTemplate}' is not valid on server anymore`,
      );
      activeTemplate = this._serverTemplateList[0];
      this._currentQuestionTemplateFile = undefined;
      this._configService.store.set('activeTemplate', activeTemplate);
    }
    if (!this._currentQuestionTemplateFile) {
      // 缓存模板内容不存在
      await this._updateCurrentQuestionTemplateFile();
      if (!this._currentQuestionTemplateFile) {
        throw new Error('serverTemplate is empty');
      }
    }
    const models = Object.keys(this._currentQuestionTemplateFile);
    if (!models.includes(activeModel)) {
      // 本地选择模型已不在服务器模型列表中
      activeModel = models[0];
      activeModelKey =
        this._currentQuestionTemplateFile[activeModel].config.modelKey;
      this._configService.store.set('activeModel', activeModel);
      this._configService.store.set('activeModelKey', activeModelKey);
    }
    this._activeModelContent = this._currentQuestionTemplateFile[activeModel];
    return this._activeModelContent;
  }

  async setProjectId(path: string, projectId: string) {
    const project = this._appDataStore.get('project');
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
    this._appDataStore.set('project', project);
  }

  async setProjectLastAddedLines(path: string, lastAddedLines: number) {
    const project = this._appDataStore.get('project');
    if (project[path]) {
      project[path].lastAddedLines = lastAddedLines;
      this._appDataStore.set('project', project);
    }
  }

  async setProjectSvn(projectPath: string, svnPath: string) {
    const project = this._appDataStore.get('project');
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
      this._appDataStore.set('project', project);
    }
  }

  async getChatList() {
    return this._localChatManager.getChatList();
  }

  async getChat(name: string) {
    return this._localChatManager.getChat(name);
  }

  async newChat(name: string) {
    return this._localChatManager.newChat(name);
  }

  async saveChat(name: string, content: ChatFileContent) {
    return this._localChatManager.saveChat(name, content);
  }

  async deleteChat(name: string) {
    return this._localChatManager.deleteChat(name);
  }

  async openChatListDir() {
    return this._localChatManager.openChatListDir();
  }

  async saveBackup(originalPath: string, projectId: string) {
    const backupData = this._appDataStore.get('backup');
    if (
      !this._localBackupManager.needBackup(originalPath, backupData.current)
    ) {
      return;
    }

    const newBackupPath = this._localBackupManager.createBackup(
      originalPath,
      projectId,
    );
    if (!backupData.current) {
      // If there is no backup data, create a new one
      backupData.current = {
        backupPathList: [newBackupPath],
        originalPath,
        projectId,
      };
    } else {
      // If the original path has changed, delete the previous backups and replace with the current backups
      if (backupData.current.originalPath !== originalPath) {
        this._localBackupManager.deleteBackups(
          backupData.previous?.backupPathList,
        );
        backupData.previous = backupData.current;
        backupData.current = {
          backupPathList: [newBackupPath],
          originalPath,
          projectId,
        };
      } else {
        backupData.current.backupPathList.push(newBackupPath);
        // Limit the number of backups to 5
        if (backupData.current.backupPathList.length > 5) {
          this._localBackupManager.deleteBackups(
            backupData.current.backupPathList.slice(0, -5),
          );
          backupData.current.backupPathList =
            backupData.current.backupPathList.slice(-5);
        }
      }
    }
    this._appDataStore.set('backup', backupData);
  }

  async retrieveBackup(previewBackup: string) {
    return this._localBackupManager.retrieveBackup(previewBackup);
  }

  async restoreBackup(isCurrent = true, index: number) {
    const backupData = isCurrent
      ? this._appDataStore.get('backup').current
      : this._appDataStore.get('backup').previous;
    if (!backupData) {
      return false;
    }

    const backupPathList = backupData.backupPathList;
    if (!backupPathList[index]) {
      return false;
    }

    this._localBackupManager.restoreBackup(
      backupPathList[index],
      backupData.originalPath,
    );

    return true;
  }

  async dismissNotice(noticeId: string): Promise<void> {
    const notice = this._appDataStore.get('notice');
    if (!notice.dismissed.includes(noticeId)) {
      notice.dismissed.push(noticeId);
    }
    this._appDataStore.set('notice', notice);
  }
}
