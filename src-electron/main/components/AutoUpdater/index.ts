import { NsisUpdater, UpdateInfo } from 'electron-updater';
import { ProgressInfo } from 'electron-builder';

export class AutoUpdater {
  private _updater: NsisUpdater;

  constructor(url: string, channel: 'beta' | 'release' = 'release') {
    this._updater = new NsisUpdater({
      channel,
      provider: 'generic',
      // url: 'http://rdee.h3c.com/h3c-ai-assistant/plugin/sourceinsight/',
      url,
    });
    this._updater.autoDownload = false;
    this._updater.autoInstallOnAppQuit = true;
    this._updater.autoRunAppAfterInstall = true;
    this._updater.disableWebInstaller = true;

    this._updater.on('update-not-available', (updateInfo) => {
      console.log('update-not-available: ', { updateInfo });
    });

    this._updater.on('update-downloaded', (event) => {
      // autoUpdater.quitAndInstall();
      console.log(event);
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
