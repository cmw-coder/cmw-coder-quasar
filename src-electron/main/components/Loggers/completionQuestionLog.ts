import { app } from 'electron';
import log from 'electron-log/main';
import path from 'path';

const completionQuestionLog = log.create({
  logId: 'completionQuestionLog',
});

completionQuestionLog.transports.file.resolvePathFn = () =>
  path.join(
    app.getPath('userData'),
    'logs',
    'completionLog',
    'completionQuestionLog.log',
  );

export default completionQuestionLog;
