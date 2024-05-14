import { createHash } from 'crypto';
import log from 'electron-log/main';
import { PromptElements } from 'main/components/PromptExtractor/types';
import { Completions, LRUCache } from 'main/components/PromptProcessor/types';
import {
  completionsPostProcess,
  getCompletionType,
  processGeneratedSuggestions,
} from 'main/components/PromptProcessor/utils';
import { timer } from 'main/utils/timer';
import { container } from 'service';
import type { ConfigService } from 'service/entities/ConfigService';
import { ServiceType } from 'shared/services';
import { api_question } from 'main/request/api';
import { CompletionType } from 'shared/types/common';

export class PromptProcessor {
  private _abortController?: AbortController;
  private _cache = new LRUCache<Completions>(100);

  async process(
    promptElements: PromptElements,
    projectId: string,
  ): Promise<Completions | undefined> {
    const appConfig = await container
      .get<ConfigService>(ServiceType.CONFIG)
      .getConfigs();

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

    const completionType = getCompletionType(promptElements);

    this._abortController = new AbortController();

    const completionConfig =
      completionType === CompletionType.Function
        ? appConfig.completionConfigs.function
        : completionType === CompletionType.Line
          ? appConfig.completionConfigs.line
          : appConfig.completionConfigs.snippet;

    try {
      const answers = await api_question(
        {
          question: promptElements.stringify(),
          maxTokens: completionConfig.maxTokenCount,
          temperature: completionConfig.temperature,
          stop: completionConfig.stopTokens,
          suffix: promptElements.suffix,
          plugin: 'SI',
          profileModel: appConfig.activeModel,
          productLine: appConfig.activeTemplate,
          subType: projectId,
          templateName:
            completionType === CompletionType.Line
              ? 'ShortLineCode'
              : 'LineCode',
        },
        this._abortController.signal,
      );
      let candidates = answers.map((answer) => answer.text);
      candidates = processGeneratedSuggestions(
        candidates,
        completionType,
        promptElements.prefix,
      );
      timer.add('CompletionGenerate', 'generationProcessed');
      this._cache.put(cacheKey, { candidates, type: completionType });
      candidates = completionsPostProcess(candidates, promptElements);
      if (candidates.length) {
        return {
          candidates,
          type: completionType,
        };
      }
    } catch (e) {
      log.error('PromptProcessor.process.error', e);
      return undefined;
    }
  }
}
