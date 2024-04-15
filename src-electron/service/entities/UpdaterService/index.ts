import { NsisUpdater, ProgressInfo, UpdateInfo } from 'electron-updater';
import { injectable, inject } from 'inversify';
import { UpdaterServiceBase } from 'shared/service-interface/UpdaterServiceBase';
import { TYPES } from 'shared/service-interface/types';
import { ConfigService } from 'service/entities/ConfigService';
import log from 'electron-log/main';

@injectable()
export class UpdaterService implements UpdaterServiceBase {
  private _updater!: NsisUpdater;
  @inject(TYPES.ConfigService)
  private _configService!: ConfigService;

  constructor() {}

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
