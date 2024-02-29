import { createHash } from 'crypto';

import { PromptElements } from 'main/components/PromptExtractor/types';
import { LRUCache } from 'main/components/PromptProcessor/types';
import {
  completionsPostProcess,
  getCompletionType,
  processHuggingFaceApi,
  processLinseerApi,
} from 'main/components/PromptProcessor/utils';
import { configStore } from 'main/stores';
import { ApiStyle } from 'main/types/model';
import { timer } from 'main/utils/timer';

export class PromptProcessor {
  private _cache = new LRUCache<string[]>(100);

  async process(
    promptElements: PromptElements,
    projectId: string,
  ): Promise<string[] | undefined> {
    const cacheKey = createHash('sha1')
      .update(promptElements.prefix.trimEnd())
      .digest('base64');
    const completionCached = this._cache.get(cacheKey);
    if (completionCached) {
      console.log('PromptProcessor.process.cacheHit', completionCached);
      return completionsPostProcess(completionCached, promptElements);
    }

    timer.add('CompletionGenerate', 'CheckedCache');

    const completionType = getCompletionType(promptElements);
    let completions: string[];

    if (configStore.apiStyle === ApiStyle.HuggingFace) {
      completions = await processHuggingFaceApi(
        configStore.modelConfig,
        promptElements,
        completionType,
      );
    } else {
      const accessToken = await configStore.getAccessToken();
      if (!accessToken) {
        configStore.login();
        return;
      }
      completions = await processLinseerApi(
        configStore.modelConfig,
        accessToken,
        promptElements,
        completionType,
        projectId,
      );
    }
    console.log('PromptProcessor.process.cacheMiss', completions);
    if (completions.length) {
      this._cache.put(cacheKey, completions);
      completions = completionsPostProcess(completions, promptElements);
    }
    return completions;
  }
}
