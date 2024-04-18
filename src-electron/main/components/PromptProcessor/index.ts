import { createHash } from 'crypto';
import log from 'electron-log/main';

import { PromptElements } from 'main/components/PromptExtractor/types';
import { Completions, LRUCache } from 'main/components/PromptProcessor/types';
import {
  completionsPostProcess,
  getCompletionType,
  processHuggingFaceApi,
  processLinseerApi,
} from 'main/components/PromptProcessor/utils';
import { CompletionErrorCause } from 'main/utils/completion';
import { timer } from 'main/utils/timer';
import { container } from 'service';
import type { ConfigService } from 'service/entities/ConfigService';
import { ServiceType } from 'shared/services';
import { ApiStyle } from 'shared/types/model';

export class PromptProcessor {
  private _abortController?: AbortController;
  private _cache = new LRUCache<Completions>(100);

  async process(
    promptElements: PromptElements,
    projectId: string,
  ): Promise<Completions | undefined> {
    const configStore = container.get<ConfigService>(
      ServiceType.CONFIG,
    ).configStore;
    const cacheKey = createHash('sha1')
      .update(promptElements.prefix.trimEnd())
      .digest('base64');
    const completionCached = this._cache.get(cacheKey);
    if (completionCached) {
      log.debug('PromptProcessor.process.cacheHit', completionCached);
      completionCached.candidates = completionsPostProcess(
        completionCached.candidates,
        promptElements,
      );
      return completionCached;
    }
    timer.add('CompletionGenerate', 'generationCheckedCache');

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
    timer.add('CompletionGenerate', 'generationProcessed');

    if (candidates.length) {
      log.info('PromptProcessor.process.cacheMiss', candidates);
      this._cache.put(cacheKey, { candidates, type });
      candidates = completionsPostProcess(candidates, promptElements);
      return {
        candidates,
        type,
      };
    }
  }
}
