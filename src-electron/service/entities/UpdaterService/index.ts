import log from 'electron-log/main';
import { NsisUpdater, ProgressInfo, UpdateInfo } from 'electron-updater';
import { injectable, inject } from 'inversify';

import { ServiceType } from 'shared/services';
import { UpdaterServiceBase } from 'shared/services/types/UpdaterServiceBase';
import type { ConfigService } from 'service/entities/ConfigService';
import type { WindowService } from 'service/entities/WindowService';

@injectable()
export class UpdaterService implements UpdaterServiceBase {
  private _updater!: NsisUpdater;

  constructor(
    @inject(ServiceType.CONFIG) private _configService: ConfigService,
    @inject(ServiceType.WINDOW) private _windowService: WindowService,
  ) {}

  init() {
    this._updater = new NsisUpdater({
      channel: 'release',
      provider: 'generic',
      url: this._configService.configStore.config.endpoints.update,
    });

    this._updater.autoDownload = false;
    this._updater.autoInstallOnAppQuit = true;
    this._updater.autoRunAppAfterInstall = true;
    this._updater.disableWebInstaller = true;

    this._updater.on('update-not-available', (updateInfo) => {
      log.info('update-not-available: ', { updateInfo });
    });

    this._updater.on('update-downloaded', (event) => {
      // autoUpdater.quitAndInstall();
      log.info(event);
    });

    this.onAvailable((updateInfo) =>
      this._windowService.floatingWindow.updateShow(updateInfo),
    );
    this.onDownloading((progressInfo) =>
      this._windowService.floatingWindow.updateProgress(progressInfo),
    );
    this.onFinish(() => this._windowService.floatingWindow.updateFinish());
  }

  onAvailable(callback: (updateInfo: UpdateInfo) => void) {
    this._updater.on('update-available', callback);
  }

  onDownloading(callback: (progressInfo: ProgressInfo) => void) {
    this._updater.on('download-progress', callback);
  }

  onFinish(callback: () => void) {
    this._updater.on('update-downloaded', callback);
  }

  async checkUpdate() {
    await this._updater.checkForUpdates();
  }

  async downloadUpdate() {
    await this._updater.downloadUpdate();
  }

  installUpdate() {
    this._updater.quitAndInstall();
  }
}
