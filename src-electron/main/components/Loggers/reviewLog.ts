import { app } from 'electron';
import log from 'electron-log/main';
import path from 'path';

const reviewLog = log.create({
  logId: 'review',
});

reviewLog.transports.file.resolvePathFn = () =>
  path.join(app.getPath('userData'), 'logs', 'reviewLog', 'review.log');

export default reviewLog;
