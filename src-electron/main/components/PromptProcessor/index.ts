import { createHash } from 'crypto';
import { PromptElements } from 'main/components/PromptExtractor/types';
import { LRUCache } from 'main/components/PromptProcessor/types';
import {
  getCompletionType,
  processGeneratedSuggestions,
} from 'main/components/PromptProcessor/utils';
import { ServiceType } from 'shared/types/service';
import { api_question } from 'main/request/api';
import { Completions, CompletionType } from 'shared/types/common';
import { container, getService } from 'main/services';
import completionLog from 'main/components/Loggers/completionLog';
import completionQuestionLog from 'main/components/Loggers/completionQuestionLog';
import { WindowService } from 'main/services/WindowService';
import { WindowType } from 'shared/types/WindowType';
import { UpdateStatusActionMessage } from 'shared/types/ActionMessage';
import { Status } from 'shared/types/service/WindowServiceTrait/StatusWindowType';

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
    const appConfig = await getService(ServiceType.CONFIG).getConfigs();
    const cacheKey = createHash('sha1')
      .update(promptElements.fullPrefix.trimEnd())
      .digest('base64');
    const completionCached = this._cache.get(cacheKey);
    this._statusWindow.sendMessageToRenderer(
      new UpdateStatusActionMessage({
        status: Status.READY,
        detail: 'PromptProcessor.process.cacheHit',
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

    // 2024-10-15 去除 CompletionType.Line
    const completionConfig =
      completionType === CompletionType.Function
        ? appConfig.completionConfigs.function
        : appConfig.completionConfigs.snippet;

    try {
      this._statusWindow.sendMessageToRenderer(
        new UpdateStatusActionMessage({
          status: Status.GENERATING,
          detail: 'PromptProcessor.process.requesting',
        }),
      );
      const questionParams = {
        question: await promptElements.stringify(completionType),
        maxTokens: completionConfig.maxTokenCount,
        temperature: completionConfig.temperature,
        // 2024-10-15 仅保留如下 stop 参数，去除 \n  \n}  }等
        stop: ['<fim_pad>', '<｜end▁of▁sentence｜>'],
        suffix: '',
        plugin: 'SI',
        profileModel: appConfig.activeModel,
        productLine: appConfig.activeTemplate,
        subType: projectId,
        templateName:
          completionType === CompletionType.Line ? 'ShortLineCode' : 'LineCode',
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
        completionType === CompletionType.Line ? 'ShortLineCode' : 'LineCode',
      );
      const answers = await api_question(
        questionParams,
        this._abortController.signal,
      );
      completionLog.debug('PromptProcessor.process.answers', answers);
      getService(ServiceType.STATISTICS).completionUpdateRequestEndTime(
        actionId,
      );
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
          status: Status.ERROR,
          detail: '生成为空',
        }),
      );
      return undefined;
    } catch (e) {
      this._statusWindow.sendMessageToRenderer(
        new UpdateStatusActionMessage({
          status: Status.ERROR,
          detail: `Error: ${e}`,
        }),
      );
      completionLog.error('PromptProcessor.process.error', e);
      return undefined;
    }
  }
}
