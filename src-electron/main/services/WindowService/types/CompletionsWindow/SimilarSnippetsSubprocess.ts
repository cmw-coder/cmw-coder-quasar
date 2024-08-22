import { MessageToSimilarSnippetsChildProxy } from 'cmw-coder-subprocess';
import { SimilarSnippetsMasterHandler } from 'cmw-coder-subprocess/dist/types/SimilarSnippetsHandler';
import completionLog from 'main/components/Loggers/completionLog';
import { cmwCoderSubprocessPath } from 'main/services/WindowService/constants';

export class SimilarSnippetsProcess
  extends MessageToSimilarSnippetsChildProxy
  implements SimilarSnippetsMasterHandler
{
  constructor() {
    super(`${cmwCoderSubprocessPath}/dist/similarSnippetsProcess.cjs`);
  }

  async log(...payloads: never[]): Promise<void> {
    completionLog.log(...payloads);
  }
}
