import {
  DiffMasterHandler,
  MessageToDiffChildProxy,
} from 'cmw-coder-subprocess';
import statisticsLog from 'main/components/Loggers/statisticsLog';
import { cmwCoderSubprocessPath } from 'main/services/WindowService/constants';

export class DiffSubprocess
  extends MessageToDiffChildProxy
  implements DiffMasterHandler
{
  constructor() {
    super(`${cmwCoderSubprocessPath}/dist/diffProcess.cjs`);
  }

  async log(...payloads: never[]): Promise<void> {
    statisticsLog.log('[FileStructureAnalysisProcess]', ...payloads);
  }
}
