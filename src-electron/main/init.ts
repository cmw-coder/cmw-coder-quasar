import { app, ipcMain } from 'electron';
import { Job, scheduleJob } from 'node-schedule';
import { release, version } from 'os';

import { statisticsReporter } from 'main/components/StatisticsReporter';
import { dataStore } from 'main/stores';
import { BaseWindow } from 'main/types/BaseWindow';
import { folderLatestModificationTime } from 'main/utils/common';
import { getAddedLines } from 'main/utils/svn';
import { triggerAction } from 'preload/types/ActionApi';
import {
  ControlMessage,
  triggerControlCallback,
} from 'preload/types/ControlApi';
import packageJson from 'root/package.json';
import { actionApiKey, controlApiKey } from 'shared/types/constants';
import { ActionMessage } from 'shared/types/ActionMessage';

const reportProjectAdditions = async () =>
  (
    await Promise.all(
      Object.entries(dataStore.store.project).map(
        async ([path, { id, lastAddedLines, svn }]) => ({
          path,
          id,
          addedLines:
            Date.now() - (await folderLatestModificationTime(path)).getTime() >
            1000 * 3600 * 24
              ? (
                  await Promise.all(
                    svn.map(
                      async ({ directory, revision }) =>
                        await getAddedLines(directory, revision),
                    ),
                  )
                ).reduce((acc, val) => acc.concat(val), []).length
              : 0,
          lastAddedLines,
        }),
      ),
    )
  )
    .filter(({ addedLines }) => addedLines > 0)
    .forEach(({ path, id, addedLines, lastAddedLines }) => {
      console.log('reportProjectAdditions', {
        path,
        id,
        addedLines,
        lastAddedLines,
      });
      dataStore.setProjectLastAddedLines(path, addedLines);
      statisticsReporter.incrementLines(
        addedLines - lastAddedLines,
        Date.now(),
        Date.now(),
        id,
        packageJson.version,
      );
    });

export const initAdditionReport = (): Job => {
  reportProjectAdditions().catch();
  return scheduleJob(
    {
      hour: 3,
      minute: 0,
    },
    reportProjectAdditions,
  );
};

export const initApplication = () => {
  console.log(`OS version: ${version()} (${release()})`);
  if (!app.requestSingleInstanceLock()) {
    app.quit();
    process.exit(-1);
  }
  app.setLoginItemSettings({
    openAtLogin: true,
  });
};

export const initIpcMain = () => {
  ipcMain.on(actionApiKey, (_, message: ActionMessage) =>
    triggerAction(message.type, message.data),
  );
  ipcMain.on(controlApiKey, (_, message: ControlMessage) =>
    triggerControlCallback(message.windowType, message.type, message.data),
  );
};

export const initWindowDestroyInterval = (baseWindow: BaseWindow) =>
  setInterval(
    () => {
      baseWindow.destroy();
    },
    1000 * 60 * 30,
  );
