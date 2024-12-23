import { app, BrowserWindow, ipcMain, Menu } from 'electron';
import { globalShortcut } from 'electron/main';
import log from 'electron-log/main';
import { inject, injectable } from 'inversify';
import { DateTime } from 'luxon';
import { Job, scheduleJob } from 'node-schedule';
import { release, version } from 'os';

import { container } from 'main/services';
import { ConfigService } from 'main/services/ConfigService';
import { DataStoreService } from 'main/services/DataStoreService';
import { UpdaterService } from 'main/services/UpdaterService';
import { WebsocketService } from 'main/services/WebsocketService';
import { WindowService } from 'main/services/WindowService';
import { registerAction, triggerAction } from 'preload/types/ActionApi';
import {
  ControlMessage,
  triggerControlCallback,
} from 'preload/types/ControlApi';
import { ACTION_API_KEY, CONTROL_API_KEY } from 'shared/constants/common';
import { SERVICE_CALL_KEY, ServiceType } from 'shared/types/service';
import { ActionMessage, ActionType } from 'shared/types/ActionMessage';
import { NetworkZone } from 'shared/config';
import { WindowType } from 'shared/types/WindowType';
import { AppServiceTrait } from 'shared/types/service/AppServiceTrait';
import * as process from 'node:process';
import * as Electron from 'electron';
import { getProjectData } from 'main/utils/completion';

interface AbstractServicePort {
  [key: string]: ((...args: unknown[]) => Promise<unknown>) | undefined;
}

@injectable()
export class AppService implements AppServiceTrait {
  private _backupScheduler?: Job;

  constructor(
    @inject(ServiceType.WINDOW)
    private _windowService: WindowService,
    @inject(ServiceType.WEBSOCKET)
    private _websocketService: WebsocketService,
    @inject(ServiceType.UPDATER)
    private _updaterService: UpdaterService,
    @inject(ServiceType.CONFIG)
    private _configService: ConfigService,
    @inject(ServiceType.DATA_STORE)
    private _dataStoreService: DataStoreService,
  ) {}

  init() {
    log.initialize();
    log.transports.file.format = '{text}';
    log.transports.file.transforms.push(({ data, message }) => {
      const { date, level, variables } = message;
      return [
        `[${DateTime.fromJSDate(date).toISO()}] ${variables?.processType}.${level.toUpperCase()}: ${data}`,
      ];
    });
    log.info('AppService init');
    this._initApplication();
    this._initBackupScheduler();
    this._initIpc();
    this._initUpdateScheduler();
    this._initShortcutHandler();
  }

  async updateBackupIntervalMinutes(intervalMinutes: number) {
    const backupData = this._dataStoreService.getAppdata().backup;
    backupData.intervalMinutes = intervalMinutes;
    this._dataStoreService.setAppData('backup', backupData);
    if (this._backupScheduler) {
      if (intervalMinutes <= 0) {
        this._backupScheduler.cancel();
      } else {
        this._backupScheduler.reschedule(`*/${intervalMinutes} * * * *`);
      }
    }
  }

  private _initApplication() {
    log.info(`OS version: ${version()} (${release()})`);
    app.disableHardwareAcceleration();
    Menu.setApplicationMenu(null);
    if (!app.requestSingleInstanceLock()) {
      app.quit();
      process.exit(-1);
    }
    app.setLoginItemSettings({
      openAtLogin: true,
    });

    app.on('second-instance', () => {
      app.focus();
      this._windowService.getWindow(WindowType.Main).show();
    });
    app.whenReady().then(async () => {
      log.info('Comware Coder is ready');
      // ========================
      log.info('Migrate data from old data store (< 1.2.0)');
      const oldProjectData =
        this._dataStoreService.dataStoreBefore1_2_0.store.project;
      const newProjectData = this._dataStoreService.getAppdata().project;
      const oldProjectKeys = Object.keys(oldProjectData);
      for (let i = 0; i < oldProjectKeys.length; i++) {
        const key = oldProjectKeys[i];
        if (newProjectData[key] === undefined) {
          newProjectData[key] = {
            ...oldProjectData[key],
            isAutoManaged: true,
          };
        }
      }
      this._dataStoreService.setAppData('project', newProjectData);
      // ========================

      // ========================
      log.info('Migrate data from old config store (< 1.2.0)');
      const oldConfigData = this._configService.configStore.data;
      if (
        oldConfigData.tokens &&
        oldConfigData.tokens.access &&
        oldConfigData.tokens.refresh
      ) {
        await this._configService.setConfigs({
          token: oldConfigData.tokens.access,
          refreshToken: oldConfigData.tokens.refresh,
        });
      }
      // ========================
      this._websocketService.startServer();
      this._websocketService.registerActions();

      const config = await this._configService.getConfigs();

      this._windowService.trayIcon.activate();
      this._triggerUpdate();

      // 创建代码窗口
      const completionWindow = this._windowService.getWindow(
        WindowType.Completions,
      );
      completionWindow.create();
      completionWindow.initReCreateTimer();

      // 创建状态窗口
      const statusWindow = this._windowService.getWindow(WindowType.Status);
      statusWindow.create();
      statusWindow.hide();

      // 创建代码选中提示窗口
      this._windowService.getWindow(WindowType.SelectionTips).create();
      if (await this._configService.getConfig('showStatusWindow')) {
        this._windowService.getWindow(WindowType.Status).show();
      }

      // 引导配置基础环境（黄、绿区 | 红区 | 路由红区）
      if (config.networkZone === NetworkZone.Unknown) {
        this._windowService.getWindow(WindowType.Welcome).show();
        return;
      }

      // 黄、绿区版本调起登录界面
      if (config.networkZone === NetworkZone.Public && !config.token) {
        this._windowService.getWindow(WindowType.Login).show();
        return;
      }

      this._dataStoreService
        .getActiveModelContent()
        .catch((e) => log.error('app.ready', e));

      // 创建主界面
      this._windowService.getWindow(WindowType.Main).create();
      if (this._dataStoreService.getAppdata().window.Main.show) {
        this._windowService.getWindow(WindowType.Main).show();
      }
    });
  }

  private _initBackupScheduler() {
    // Trigger backup every 5 minutes
    this._backupScheduler = scheduleJob(
      `*/${this._dataStoreService.getAppdata().backup.intervalMinutes} * * * *`,
      () => {
        const clientInfo = this._websocketService.getClientInfo();
        if (clientInfo && clientInfo.currentFile?.length) {
          try {
            const { id: projectId } = getProjectData(clientInfo.currentProject);
            log.debug(`Creating backup for '${clientInfo.currentFile}'`);
            this._dataStoreService
              .saveBackup(clientInfo.currentFile, projectId)
              .catch();
          } catch (e) {
            console.warn('Backup failed', e);
          }
        }
      },
    );
  }

  private _initIpc() {
    ipcMain.handle(
      SERVICE_CALL_KEY,
      <T extends ServiceType>(
        _: Electron.IpcMainInvokeEvent,
        serviceName: T,
        functionName: string,
        ...payloads: unknown[]
      ) => {
        const service = container.get<AbstractServicePort>(serviceName);
        const func = service[functionName];
        if (typeof func === 'function') {
          return func.bind(service)(...payloads);
        }
        throw new Error('Function not found');
      },
    );
    ipcMain.on(ACTION_API_KEY, (_, message: ActionMessage) =>
      triggerAction(message.type, message.data),
    );
    ipcMain.on(CONTROL_API_KEY, (_, message: ControlMessage) =>
      triggerControlCallback(message.windowType, message.type, message.data),
    );

    registerAction(
      ActionType.UpdateDownload,
      `main.main.${ActionType.UpdateDownload}`,
      async () => {
        await this._updaterService.downloadUpdate();
      },
    );
    registerAction(
      ActionType.UpdateFinish,
      `main.main.${ActionType.UpdateFinish}`,
      () => this._updaterService.installUpdate(),
    );
  }

  private _initShortcutHandler() {
    app.whenReady().then(() => {
      // 注册选中代码快捷键
      globalShortcut.register('CommandOrControl+Alt+I', async () => {
        await this._windowService.addSelectionToChat();
      });
      // globalShortcut.register('CommandOrControl+Alt+L', async () => {
      //   await this._windowService.reviewSelection();
      // });
      // 注册open devtool 快捷键
      globalShortcut.register('CommandOrControl+Shift+I', () => {
        const window = BrowserWindow.getFocusedWindow();
        if (window) {
          window.webContents.openDevTools();
        }
      });
    });
  }

  private _initUpdateScheduler() {
    scheduleJob(
      {
        hour: [1, 13],
        minute: 0,
      },
      () => this._triggerUpdate(),
    );
  }

  private _triggerUpdate() {
    this._windowService.trayIcon.notify({
      title: '自动更新',
      content: '正在检查是否有新版本……',
    });
    this._updaterService.checkUpdate().catch();
  }
}
