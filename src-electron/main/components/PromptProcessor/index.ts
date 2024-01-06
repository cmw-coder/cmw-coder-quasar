import { createHash } from 'crypto';

import { PromptComponents } from 'main/components/PromptExtractor/types';
import { LRUCache } from 'main/components/PromptProcessor/types';
import {
  checkIsSnippet,
  processHuggingFaceApi,
  processLinseerApi,
} from 'main/components/PromptProcessor/utils';
import { configStore } from 'main/stores';
import { ApiStyle } from 'main/types/model';
import { Completions } from 'shared/types/common';

export class PromptProcessor {
  private _cache = new LRUCache<Completions>(100);

  async process(
    promptComponents: PromptComponents,
    prefix: string,
    projectId: string
  ): Promise<Completions | undefined> {
    const cacheKey = createHash('sha1')
      .update(prefix.trimEnd())
      .digest('base64');
    const promptCached = this._cache.get(cacheKey);
    if (promptCached) {
      return promptCached;
    }

    const isSnippet = checkIsSnippet(prefix);
    let completions: Completions;

    if (configStore.apiStyle === ApiStyle.HuggingFace) {
      completions = await processHuggingFaceApi(
        configStore.modelConfig,
        promptComponents,
        isSnippet
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
        isSnippet,
        projectId
      );
    }
    console.log('PromptProcessor.process.normal', completions);
    if (completions.contents.length) {
      this._cache.put(cacheKey, completions);
    }
    return completions;
  }
}
