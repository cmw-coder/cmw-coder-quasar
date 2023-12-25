import { createHash } from 'crypto';

import { PromptComponents } from 'main/components/PromptExtractor/types';
import { LRUCache } from 'main/components/PromptProcessor/types';
import {
  checkIsSnippet,
  processHuggingFaceApi,
  processLinseerApi,
} from 'main/components/PromptProcessor/utils';
import { ApiStyle } from 'main/types/model';
import { configStore } from 'main/stores';

export class PromptProcessor {
  private _cache = new LRUCache<string[]>(100);

  async process(
    promptComponents: PromptComponents,
    prefix: string,
    projectId: string
  ): Promise<string[]> {
    const cacheKey = createHash('sha1')
      .update(prefix.trimEnd())
      .digest('base64');
    const promptCached = this._cache.get(cacheKey);
    if (promptCached) {
      return promptCached;
    }

    const isSnippet = checkIsSnippet(prefix);
    let processedSuggestions: string[] = [];

    try {
      if (configStore.apiStyle === ApiStyle.HuggingFace) {
        processedSuggestions = await processHuggingFaceApi(
          configStore.modelConfig,
          promptComponents,
          isSnippet
        );
      } else {
        const accessToken = await configStore.getAccessToken();
        if (!accessToken) {
          // TODO: Prompt refresh tokens
          configStore.login();
          return [];
        }
        processedSuggestions = await processLinseerApi(
          configStore.modelConfig,
          accessToken,
          promptComponents,
          isSnippet,
          projectId
        );
      }
    } catch (e) {
      console.warn('PromptProcessor.process.error', e);
    }
    console.log('PromptProcessor.process.normal', processedSuggestions);
    if (processedSuggestions.length) {
      this._cache.put(cacheKey, processedSuggestions);
    }
    return processedSuggestions;
  }
}
