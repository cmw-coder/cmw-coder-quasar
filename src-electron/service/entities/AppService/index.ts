import { app, globalShortcut, ipcMain } from 'electron';
import log from 'electron-log/main';
import { inject, injectable } from 'inversify';
import { DateTime } from 'luxon';
import { scheduleJob } from 'node-schedule';
import { release, userInfo, version } from 'os';
import { container } from 'service';
import { ConfigService } from 'service/entities/ConfigService';
import { DataStoreService } from 'service/entities/DataStoreService';
import { UpdaterService } from 'service/entities/UpdaterService';
import { WebsocketService } from 'service/entities/WebsocketService';
import { WindowService } from 'service/entities/WindowService';
import { reportProjectAdditions } from 'main/utils/svn';
import { registerAction, triggerAction } from 'preload/types/ActionApi';
import {
  ControlMessage,
  triggerControlCallback,
} from 'preload/types/ControlApi';
import { ACTION_API_KEY, CONTROL_API_KEY } from 'shared/constants/common';
import { SERVICE_CALL_KEY, ServiceType } from 'shared/services';
import { AppServiceBase } from 'shared/services/types/AppServiceBase';
import { ActionMessage, ActionType } from 'shared/types/ActionMessage';
import { NetworkZone } from 'shared/config';

interface AbstractServicePort {
  [key: string]: ((...args: unknown[]) => Promise<unknown>) | undefined;
}

@injectable()
export class AppService implements AppServiceBase {
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
    log.info('AppService init', userInfo().username);
    this.initApplication();
    this.initAdditionReport();
    this.initIpcMain();
    this.initShortcutHandler();
  }

  initApplication() {
    log.initialize();
    log.transports.file.format = '{text}';
    log.transports.file.transforms.push(({ data, message }) => {
      const { date, level, variables } = message;
      return [
        `[${DateTime.fromJSDate(date).toISO()}] ${variables?.processType}.${level.toUpperCase()}: ${data}`,
      ];
    });

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
      this._windowService.mainWindow.activate();
    });
    app.whenReady().then(async () => {
      log.info('Comware Coder is ready');
      // this._windowService.floatingWindow.activate();
      // this._windowService.immersiveWindow.activate();
      // this._windowService.mainWindow.activate();

      this._websocketService.startServer();
      this._websocketService.registerActions();

      const config = await this._configService.getConfigs();

      this._windowService.trayIcon.notify('正在检查更新……');
      this._updaterService.checkUpdate().catch();

      scheduleJob(
        {
          hour: 4,
          minute: 0,
        },
        () => {
          this._windowService.trayIcon.notify('正在检查更新……');
          this._updaterService.checkUpdate().catch();
        },
      );

      this._windowService.trayIcon.activate();

      // 引导配置基础环境（黄、绿区 | 红区 | 路由红区）
      if (config.networkZone === NetworkZone.Unknown) {
        this._windowService.startSettingWindow.activate();
        return;
      }

      // 黄、绿区版本调起登录界面
      if (config.networkZone === NetworkZone.Public && !config.token) {
        // this._windowService.floatingWindow.login(
        //   this._windowService.mainWindow.isVisible,
        // );
        this._windowService.loginWindow.activate();
        return;
      }

      // 激活主窗口
      this._windowService.mainWindow.activate();
      // 激活代码窗口
      this._windowService.completionsWindow.activate();

      this._dataStoreService.getActiveModelContent();
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
      ActionType.ClientSetProjectId,
      `main.main.${ActionType.ClientSetProjectId}`,
      ({ project, projectId }) => {
        this._dataStoreService.dataStore
          .setProjectId(project, projectId)
          .catch();
      },
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
