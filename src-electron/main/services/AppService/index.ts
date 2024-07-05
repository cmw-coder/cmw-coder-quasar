import { app, globalShortcut, ipcMain } from 'electron';
import log from 'electron-log/main';
import { inject, injectable } from 'inversify';
import { DateTime } from 'luxon';
import { scheduleJob } from 'node-schedule';
import { release, version } from 'os';
import { container } from 'main/services';
import { ConfigService } from 'main/services/ConfigService';
import { DataStoreService } from 'main/services/DataStoreService';
import { UpdaterService } from 'main/services/UpdaterService';
import { WebsocketService } from 'main/services/WebsocketService';
import { WindowService } from 'main/services/WindowService';
import { reportProjectAdditions } from 'main/utils/svn';
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

interface AbstractServicePort {
  [key: string]: ((...args: unknown[]) => Promise<unknown>) | undefined;
}

@injectable()
export class AppService implements AppServiceTrait {
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
    this.initApplication();
    this.initAdditionReport();
    this.initIpcMain();
    this.initShortcutHandler();
  }

  initApplication() {
    log.info(`OS version: ${version()} (${release()})`);
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
          newProjectData[key] = oldProjectData[key];
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

      this._windowService.trayIcon.notify('正在检查更新……');
      this._updaterService.checkUpdate().catch();

      scheduleJob(
        {
          hour: [1, 13],
          minute: 0,
        },
        () => {
          this._windowService.trayIcon.notify('正在检查更新……');
          this._updaterService.checkUpdate().catch();
        },
      );

      this._windowService.trayIcon.activate();
      // 创建代码窗口
      this._windowService.getWindow(WindowType.Completions).create();
      this._windowService.getWindow(WindowType.Completions).initReCreateTimer();

      // 创建代码选中提示窗口
      this._windowService.getWindow(WindowType.SelectionTips).create();
      // for dev
      // setTimeout(() => {
      //   this._windowService.getWindow(WindowType.SelectionTips).show();
      // }, 3000);

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

  initAdditionReport() {
    reportProjectAdditions().catch();
    return scheduleJob(
      {
        hour: 3,
        minute: 0,
      },
      reportProjectAdditions,
    );
  }

  initIpcMain() {
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

  initShortcutHandler() {
    app.on('browser-window-blur', () => {
      globalShortcut.unregisterAll();
    });
    app.on('browser-window-focus', () => {
      globalShortcut.register('CommandOrControl+R', () => {
        log.debug('CommandOrControl+R is pressed: Shortcut Disabled');
      });
      globalShortcut.register('CommandOrControl+Shift+R', () => {
        log.debug('CommandOrControl+Shift+R is pressed: Shortcut Disabled');
      });
      globalShortcut.register('F5', () => {
        log.debug('F5 is pressed: Shortcut Disabled');
      });
      globalShortcut.register('Shift+F5', () => {
        log.debug('Shift+F5 is pressed: Shortcut Disabled');
      });
    });
  }
}
