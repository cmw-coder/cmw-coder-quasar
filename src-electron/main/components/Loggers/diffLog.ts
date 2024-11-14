import { app } from 'electron';
import log from 'electron-log/main';
import path from 'path';

const diffLog = log.create({
  logId: 'diff',
});

diffLog.transports.file.resolvePathFn = () =>
  path.join(app.getPath('userData'), 'logs', 'diffLog', 'diff.log');

export default diffLog;
