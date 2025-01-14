import { app } from 'electron';
import log from 'electron-log/main';
import path from 'path';

const codeSyncTaskLog = log.create({
  logId: 'codeSyncTaskLog',
});

codeSyncTaskLog.transports.file.resolvePathFn = () =>
  path.join(
    app.getPath('userData'),
    'logs',
    'codeSyncTaskLog',
    'codeSyncTaskLog.log',
  );

export default codeSyncTaskLog;
