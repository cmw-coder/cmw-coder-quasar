import { createHash } from 'crypto';

import { PromptElements } from 'main/components/PromptExtractor/types';
import { Completions, LRUCache } from 'main/components/PromptProcessor/types';
import {
  completionsPostProcess,
  getCompletionType,
  processHuggingFaceApi,
  processLinseerApi,
} from 'main/components/PromptProcessor/utils';
import { configStore } from 'main/stores';
import { CompletionErrorCause } from 'main/utils/completion';
import { timer } from 'main/utils/timer';
import { ApiStyle } from 'shared/types/model';

export class PromptProcessor {
  private _abortController?: AbortController;
  private _cache = new LRUCache<Completions>(100);

  async process(
    promptElements: PromptElements,
    projectId: string,
  ): Promise<Completions | undefined> {
    const cacheKey = createHash('sha1')
      .update(promptElements.prefix.trimEnd())
      .digest('base64');
    const completionCached = this._cache.get(cacheKey);
    if (completionCached) {
      console.log('PromptProcessor.process.cacheHit', completionCached);
      completionCached.candidates = completionsPostProcess(
        completionCached.candidates,
        promptElements,
      );
      return completionCached;
    }
    timer.add('CompletionGenerate', 'CheckedCache');

    this._abortController?.abort();

    const type = getCompletionType(promptElements);
    let candidates: string[];

    if (configStore.apiStyle === ApiStyle.HuggingFace) {
      this._abortController = new AbortController();
      candidates = await processHuggingFaceApi(
        configStore.modelConfig,
        promptElements,
        type,
        this._abortController.signal,
      );
    } else {
      const accessToken = await configStore.getAccessToken();
      if (!accessToken) {
        throw new Error('Access token is not available.', {
          cause: CompletionErrorCause.accessToken,
        });
      }
      this._abortController = new AbortController();
      candidates = await processLinseerApi(
        configStore.modelConfig,
        accessToken,
        promptElements,
        type,
        projectId,
        this._abortController.signal,
      );
    }
    this._abortController = undefined;

    if (candidates.length) {
      console.log('PromptProcessor.process.cacheMiss', candidates);
      this._cache.put(cacheKey, { candidates, type });
      candidates = completionsPostProcess(candidates, promptElements);
      return {
        candidates,
        type,
      };
    }
  }
}
