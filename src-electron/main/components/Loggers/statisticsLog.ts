import { app } from 'electron';
import log from 'electron-log/main';
import path from 'path';

const statisticsLog = log.create({
  logId: 'statistics',
});

statisticsLog.transports.file.resolvePathFn = () =>
  path.join(
    app.getPath('userData'),
    'logs',
    'statisticsLog',
    'statisticsLog.log',
  );

export default statisticsLog;
