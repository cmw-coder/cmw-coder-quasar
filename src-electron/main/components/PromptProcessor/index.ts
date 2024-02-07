import { createHash } from 'crypto';

import { PromptElements } from 'main/components/PromptExtractor/types';
import { LRUCache } from 'main/components/PromptProcessor/types';
import {
  getCompletionType,
  processHuggingFaceApi,
  processLinseerApi,
} from 'main/components/PromptProcessor/utils';
import { configStore } from 'main/stores';
import { ApiStyle } from 'main/types/model';

export class PromptProcessor {
  private _cache = new LRUCache<string[]>(100);

  async process(
    promptComponents: PromptElements,
    prefix: string,
    projectId: string,
  ): Promise<string[] | undefined> {
    const cacheKey = createHash('sha1')
      .update(prefix.trimEnd())
      .digest('base64');
    const promptCached = this._cache.get(cacheKey);
    if (promptCached) {
      return promptCached;
    }

    const completionType = getCompletionType(promptComponents);
    let completions: string[];

    if (configStore.apiStyle === ApiStyle.HuggingFace) {
      completions = await processHuggingFaceApi(
        configStore.modelConfig,
        promptComponents,
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
        promptComponents,
        completionType,
        projectId,
      );
    }
    console.log('PromptProcessor.process.normal', completions);
    if (completions.length) {
      this._cache.put(cacheKey, completions);
    }
    return completions;
  }
}
