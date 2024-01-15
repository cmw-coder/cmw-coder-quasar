import { autoUpdater } from 'electron-updater';
import { IpcMain } from "electron"
import { MainWindow } from 'main/components/MainWindow';
export const checkUpdate = (win: MainWindow, ipcMain:IpcMain) => {
    autoUpdater.autoDownload = true; // 自动下载
    autoUpdater.autoInstallOnAppQuit = true; // 应用退出后自动安装
    const mainWin = win;
    // 检测是否有更新包并通知
    autoUpdater.checkForUpdatesAndNotify().catch();
    // 监听渲染进程的 install 事件，触发退出应用并安装
    ipcMain.handle('install', () => autoUpdater.quitAndInstall());

    autoUpdater.on('update-available', (info) => {
        console.log('有新版本需要更新');
    });
    
    autoUpdater.on('update-not-available', (info) => {
        console.log('无需更新');
    });
      
    autoUpdater.on('download-progress', (prog) => {
        mainWin.getWindowWebContents()?.send('update', {
          speed: Math.ceil(prog.bytesPerSecond / 1000), // 网速
          percent: Math.ceil(prog.percent), // 百分比
        });
    });
    autoUpdater.on('update-downloaded', (info) => {
        mainWin.getWindowWebContents()?.send('downloaded');
        // 下载完成后强制用户安装，不推荐
        // autoUpdater.quitAndInstall();
    });

};


  
