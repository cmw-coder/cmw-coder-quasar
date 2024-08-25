import { app } from 'electron';
import log from 'electron-log/main';
import path from 'path';

const completionLog = log.create({
  logId: 'statistics',
});

completionLog.transports.file.resolvePathFn = () =>
  path.join(
    app.getPath('userData'),
    'logs',
    'completionLog',
    'completionLog.log',
  );

export default completionLog;
