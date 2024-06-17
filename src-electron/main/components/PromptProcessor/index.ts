import { createHash } from 'crypto';
import log from 'electron-log/main';
import { PromptElements } from 'main/components/PromptExtractor/types';
import { getBoundingSuffix } from 'main/components/PromptExtractor/utils';
import { Completions, LRUCache } from 'main/components/PromptProcessor/types';
import {
  getCompletionType,
  processGeneratedSuggestions,
} from 'main/components/PromptProcessor/utils';
import { timer } from 'main/utils/timer';
import { ServiceType } from 'shared/types/service';
import { api_question } from 'main/request/api';
import { CompletionType } from 'shared/types/common';
import { getService } from 'main/services';

export class PromptProcessor {
  private _abortController?: AbortController;
  private _cache = new LRUCache<Completions>(100);

  async process(
    promptElements: PromptElements,
    projectId: string,
  ): Promise<Completions | undefined> {
    const appConfig = await getService(ServiceType.CONFIG).getConfigs();

    const cacheKey = createHash('sha1')
      .update(promptElements.prefix.trimEnd())
      .digest('base64');
    const completionCached = this._cache.get(cacheKey);
    if (completionCached) {
      log.debug('PromptProcessor.process.cacheHit', completionCached);
      return completionCached;
      // return {
      //   candidates: completionsPostProcess(
      //     completionCached.candidates,
      //     promptElements,
      //   ),
      //   type: completionCached.type,
      // };
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
      const questionParams = {
        question: await promptElements.stringify(completionType),
        maxTokens: completionConfig.maxTokenCount,
        temperature: completionConfig.temperature,
        stop: completionConfig.stopTokens,
        suffix:
          getBoundingSuffix(promptElements.suffix) ?? promptElements.suffix,
        plugin: 'SI',
        profileModel: appConfig.activeModel,
        productLine: appConfig.activeTemplate,
        subType: projectId,
        templateName:
          completionType === CompletionType.Line ? 'ShortLineCode' : 'LineCode',
      };
      log.debug('PromptProcessor.process.questionParams', questionParams);
      const answers = await api_question(
        questionParams,
        this._abortController.signal,
      );
      let candidates = answers.map((answer) => answer.text);
      candidates = processGeneratedSuggestions(
        candidates,
        completionType,
        promptElements.prefix,
      );
      timer.add('CompletionGenerate', 'generationProcessed');
      if (candidates.length) {
        log.info('PromptProcessor.process.cacheMiss', candidates);
        this._cache.put(cacheKey, { candidates, type: completionType });
        return {
          candidates: candidates,
          type: completionType,
        };
        // return {
        //   candidates: completionsPostProcess(candidates, promptElements),
        //   type: completionType,
        // };
      }
    } catch (e) {
      log.error('PromptProcessor.process.error', e);
      return undefined;
    }
  }
}
