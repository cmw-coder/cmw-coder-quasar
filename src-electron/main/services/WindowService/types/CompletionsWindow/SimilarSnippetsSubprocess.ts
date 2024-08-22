import { MessageToSimilarSnippetsChildProxy } from 'cmw-coder-subprocess';
import { SimilarSnippetsMasterHandler } from 'cmw-coder-subprocess/dist/types/SimilarSnippetsHandler';
import Logger from 'electron-log/main';
import { cmwCoderSubprocessPath } from 'main/services/WindowService/constants';

export class SimilarSnippetsProcess
  extends MessageToSimilarSnippetsChildProxy
  implements SimilarSnippetsMasterHandler
{
  constructor() {
    super(`${cmwCoderSubprocessPath}/dist/similarSnippetsProcess.cjs`);
  }

  async log(...payloads: never[]): Promise<void> {
    Logger.log(`[SimilarSnippetsProcess ${this.pid}]`, ...payloads);
  }
}
