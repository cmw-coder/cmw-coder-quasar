import log from 'electron-log/main';
import { NsisUpdater, ProgressInfo, UpdateInfo } from 'electron-updater';
import { injectable, inject } from 'inversify';
import packageJson from 'root/package.json';
import { ServiceType } from 'shared/types/service';
import { UpdaterServiceTrait } from 'shared/types/service/UpdaterServiceTrait';
import { WindowType } from 'shared/types/WindowType';
import { ConfigService } from 'main/services/ConfigService';
import { WindowService } from 'main/services/WindowService';
import { NetworkZone } from 'shared/config';

@injectable()
export class UpdaterService implements UpdaterServiceTrait {
  private _updater!: NsisUpdater;
  private updateUrl!: string;

  constructor(
    @inject(ServiceType.CONFIG) private _configService: ConfigService,
    @inject(ServiceType.WINDOW) private _windowService: WindowService,
  ) {}

  async init() {
    const { baseServerUrl, networkZone } = this._configService.getConfigsSync();
    this.updateUrl =
      networkZone === NetworkZone.Public
        ? `${baseServerUrl}/h3c-ai-assistant/plugin/sourceinsight`
        : `${baseServerUrl}/h3c-ai-assistant/cmw-coder`;
    this._updater = new NsisUpdater({
      channel: 'release',
      provider: 'generic',
      url: this.updateUrl,
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

    this.onAvailable((updateInfo) => {
      const { version, releaseDate } = updateInfo;
      const searchString = {
        currentVersion: packageJson.version,
        newVersion: version,
        releaseDate,
      };
      this._windowService.getWindow(WindowType.Update).activate(searchString);
    });
    this.onDownloading((progressInfo) =>
      this._windowService
        .getWindow(WindowType.Update)
        .updateProgress(progressInfo),
    );
    this.onFinish(() =>
      this._windowService.getWindow(WindowType.Update).updateFinish(),
    );
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
