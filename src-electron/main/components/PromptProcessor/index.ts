import { createHash } from 'crypto';

import completionLog from 'main/components/Loggers/completionLog';
import completionQuestionLog from 'main/components/Loggers/completionQuestionLog';
import { PromptElements } from 'main/components/PromptExtractor/types';
import { LRUCache } from 'main/components/PromptProcessor/types';
import {
  getCompletionType,
  processGeneratedSuggestions,
} from 'main/components/PromptProcessor/utils';
import { api_question } from 'main/request/api';
import { container, getService } from 'main/services';
import { WindowService } from 'main/services/WindowService';

import { UpdateStatusActionMessage } from 'shared/types/ActionMessage';
import {
  Completions,
  CompletionStatus,
  CompletionType,
} from 'shared/types/common';
import { ServiceType } from 'shared/types/service';
import { WindowType } from 'shared/types/service/WindowServiceTrait/types';

export class PromptProcessor {
  private _abortController?: AbortController;
  private _cache = new LRUCache<Completions>(100);
  private _statusWindow = container
    .get<WindowService>(ServiceType.WINDOW)
    .getWindow(WindowType.Status);

  async process(
    actionId: string,
    promptElements: PromptElements,
    projectId: string,
  ): Promise<Completions | undefined> {
    const appConfig = await getService(ServiceType.CONFIG).getStore();
    const cacheKey = createHash('sha1')
      .update(promptElements.fullPrefix.trimEnd())
      .digest('base64');
    const completionCached = this._cache.get(cacheKey);
    this._statusWindow.sendMessageToRenderer(
      new UpdateStatusActionMessage({
        status: CompletionStatus.Standby,
        detail: '已从缓存中获取到补全',
      }),
    );
    if (completionCached) {
      completionLog.debug('PromptProcessor.process.cacheHit', completionCached);
      return completionCached;
    }

    this._abortController?.abort();

    const completionType = getCompletionType(promptElements);
    completionLog.debug(
      'PromptProcessor.process.completionType',
      promptElements,
      completionType,
    );

    this._abortController = new AbortController();

    const completionConfig =
      completionType === CompletionType.Function
        ? appConfig.completionConfigs.function
        : appConfig.completionConfigs.snippet;

    this._statusWindow.sendMessageToRenderer(
      new UpdateStatusActionMessage({
        status: CompletionStatus.Requesting,
        detail: '正在向服务器请求补全……',
      }),
    );
    const questionParams = {
      question: await promptElements.stringify(completionType),
      maxTokens: completionConfig.maxTokenCount,
      temperature: completionConfig.temperature,
      stop: completionConfig.stopTokens,
      suffix: '',
      plugin: 'SI',
      profileModel: appConfig.activeModel,
      productLine: appConfig.activeTemplate,
      subType: projectId,
      templateName: 'LineCode',
    };
    completionLog.debug('PromptProcessor.process.questionParams', {
      ...questionParams,
      question: '',
      suffix: '',
    });
    completionQuestionLog.debug(
      'PromptProcessor.process.questionParams.question',
      questionParams.question.replace(/\r?\n/g, '\\n'),
    );
    getService(ServiceType.STATISTICS).completionUpdatePromptConstructTime(
      actionId,
      appConfig.activeModel,
      'LineCode',
    );
    const answers = await api_question(
      questionParams,
      this._abortController.signal,
    );
    completionLog.debug('PromptProcessor.process.answers', answers);
    getService(ServiceType.STATISTICS).completionUpdateRequestEndTime(actionId);
    let candidates = answers.map((answer) => answer.text);
    candidates = processGeneratedSuggestions(
      candidates,
      promptElements.fullPrefix,
    );
    if (candidates.length) {
      completionLog.info('PromptProcessor.process.cacheMiss', candidates);
      this._cache.put(cacheKey, { candidates, type: completionType });
      return {
        candidates: candidates,
        type: completionType,
      };
    }
    this._statusWindow.sendMessageToRenderer(
      new UpdateStatusActionMessage({
        status: CompletionStatus.Empty,
        detail: 'AI 认为无需补全',
      }),
    );
    return undefined;
  }
}
