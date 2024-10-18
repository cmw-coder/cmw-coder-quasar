import {
  MessageToFileStructureAnalysisChildProxy,
  FileStructureAnalysisMasterHandler,
} from 'cmw-coder-subprocess';
import completionLog from 'main/components/Loggers/completionLog';
import { cmwCoderSubprocessPath } from 'main/services/WindowService/constants';

export class FileStructureAnalysisProcess
  extends MessageToFileStructureAnalysisChildProxy
  implements FileStructureAnalysisMasterHandler
{
  constructor() {
    super(`${cmwCoderSubprocessPath}/dist/fileStructureAnalysisProcess.cjs`);
  }

  async log(...payloads: never[]): Promise<void> {
    completionLog.log('[FileStructureAnalysisProcess]', ...payloads);
  }

  async getScriptDir(): Promise<string> {
    return cmwCoderSubprocessPath;
  }
}
