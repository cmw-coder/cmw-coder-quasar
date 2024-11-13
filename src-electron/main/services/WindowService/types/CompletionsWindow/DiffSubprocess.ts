import {
  DiffMasterHandler,
  MessageToDiffChildProxy,
} from 'cmw-coder-subprocess';
import diffLog from 'main/components/Loggers/diffLog';
import { cmwCoderSubprocessPath } from 'main/services/WindowService/constants';

export class DiffSubprocess
  extends MessageToDiffChildProxy
  implements DiffMasterHandler
{
  constructor() {
    super(`${cmwCoderSubprocessPath}/dist/diffProcess.cjs`);
  }

  async log(...payloads: never[]): Promise<void> {
    diffLog.log('[FileStructureAnalysisProcess]', ...payloads);
  }
}
