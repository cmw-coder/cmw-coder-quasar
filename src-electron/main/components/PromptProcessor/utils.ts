import { CanceledError } from 'axios';
import log from 'electron-log/main';
import { extname } from 'path';

import { PromptElements } from 'main/components/PromptExtractor/types';
import {
  HuggingFaceModelConfigType,
  LinseerModelConfigType,
} from 'main/stores/config/types';
import { generate, generateRd } from 'main/utils/axios';
import { timer } from 'main/utils/timer';
import { CompletionType } from 'shared/types/common';
import { ApiStyle } from 'shared/types/model';

// Start with '//' or '#' or '{' or '/*', or is '***/'
const detectRegex = /^\/\/|^#|^\{|^\/\*|^\*+\/$/;

export const completionsPostProcess = (
  completions: string[],
  promptElements: PromptElements,
) => {
  const firstSuffixLine = promptElements.suffix.trim().split(/\r?\n/)[0].trim();
  return completions.map((completion) => {
    const lines = completion.split(/\r?\n/);
    const sameContentIndex = lines.findIndex(
      (line) => line.trim().length > 2 && line.trim() === firstSuffixLine,
    );
    return sameContentIndex === -1
      ? completion
      : lines.slice(0, sameContentIndex).join('\r\n');
  });
};

export const getCompletionType = (
  promptElements: PromptElements,
): CompletionType => {
  const lastLine = promptElements.prefix.split('\r\n').at(-1) ?? '';
  if (lastLine.trim().length > 0) {
    return CompletionType.Line;
  }

  const lastNonEmptyLine =
    promptElements.prefix.trimEnd().split('\r\n').at(-1) ?? '';
  if (
    detectRegex.test(lastNonEmptyLine) &&
    extname(promptElements.file ?? '') !== 'h'
  ) {
    return CompletionType.Function;
  }
  if (promptElements.similarSnippet) {
    return CompletionType.Snippet;
  }
  return CompletionType.Line;
};

export const processHuggingFaceApi = async (
  modelConfig: HuggingFaceModelConfigType,
  promptElements: PromptElements,
  completionType: CompletionType,
  abortSignal: AbortSignal,
): Promise<string[]> => {
  const { completionConfigs, separateTokens } = modelConfig;
  const completionConfig =
    completionType === CompletionType.Function
      ? completionConfigs.function
      : completionType === CompletionType.Line
        ? completionConfigs.line
        : completionConfigs.snippet;
  const { endpoint, maxTokenCount, stopTokens, suggestionCount, temperature } =
    completionConfig;

  try {
    const {
      data: {
        details: { best_of_sequences },
        generated_text,
      },
    } = await generate(
      endpoint,
      {
        inputs: promptElements.stringify(ApiStyle.HuggingFace, separateTokens),
        parameters: {
          best_of: suggestionCount,
          details: true,
          do_sample: true,
          max_new_tokens: maxTokenCount,
          stop: stopTokens,
          temperature: temperature,
          top_p: 0.95,
        },
      },
      abortSignal,
    );
    timer.add('CompletionGenerate', 'generationRequested');

    let generatedSuggestions: string[] = [];
    if (best_of_sequences && best_of_sequences.length) {
      generatedSuggestions = best_of_sequences.map(
        (bestOfSequence) => bestOfSequence.generated_text,
      );
    } else {
      generatedSuggestions.push(generated_text);
    }
    return _processGeneratedSuggestions(
      generatedSuggestions,
      completionType,
      promptElements.prefix,
    );
  } catch (error) {
    if (error instanceof CanceledError) {
      log.debug(
        'PromptProcessor.process.processHuggingFaceApi',
        'Request aborted',
      );
    } else {
      log.warn(error);
    }
  }
  return [];
};

export const processLinseerApi = async (
  modelConfig: LinseerModelConfigType,
  accessToken: string,
  promptElements: PromptElements,
  completionType: CompletionType,
  projectId: string,
  abortSignal: AbortSignal,
): Promise<string[]> => {
  const { completionConfigs, endpoint, separateTokens } = modelConfig;
  const completionConfig =
    completionType === CompletionType.Function
      ? completionConfigs.function
      : completionType === CompletionType.Line
        ? completionConfigs.line
        : completionConfigs.snippet;
  const { maxTokenCount, stopTokens, subModelType, temperature } =
    completionConfig;

  try {
    const generatedSuggestions = (
      await generateRd(
        endpoint,
        {
          question: promptElements.stringify(ApiStyle.Linseer, separateTokens),
          model: subModelType,
          maxTokens: maxTokenCount,
          temperature: temperature,
          stop: stopTokens,
          suffix: promptElements.suffix,
          plugin: 'SI',
          profileModel: '百业灵犀-13B',
          templateName:
            completionType === CompletionType.Line
              ? 'ShortLineCode'
              : 'LineCode',
          subType: projectId,
        },
        accessToken,
        abortSignal,
      )
    ).data
      .map((item) => item.text)
      .filter((completion) => completion.trim().length > 0);
    timer.add('CompletionGenerate', 'generationRequested');

    return _processGeneratedSuggestions(
      generatedSuggestions,
      completionType,
      promptElements.prefix,
    );
  } catch (error) {
    if (error instanceof CanceledError) {
      log.debug('PromptProcessor.process.processLinseerApi', 'Request aborted');
    } else {
      log.warn(error);
    }
  }
  return [];
};

const _processGeneratedSuggestions = (
  generatedSuggestions: string[],
  completionType: CompletionType,
  prefix: string,
): string[] => {
  // TODO: Replace Date Created if needed.
  const result = generatedSuggestions
    /// Filter out contents that are the same as the prefix.
    .map((generatedSuggestion) =>
      generatedSuggestion.substring(0, prefix.length) === prefix
        ? generatedSuggestion.substring(prefix.length)
        : generatedSuggestion,
    )
    /// Replace '\t' with 4 spaces.
    .map((generatedSuggestion) =>
      generatedSuggestion.replace(/\t/g, ' '.repeat(4)),
    )
    /// Replace '\r' or '\n' with '\r\n'.
    .map((generatedSuggestion) =>
      generatedSuggestion.replace(/\r\n?/g, '\r\n').replace(/\r?\n/g, '\r\n'),
    )
    /// Filter out leading empty lines.
    .map((generatedSuggestion) => {
      const lines = generatedSuggestion.split('\r\n');
      const firstNonEmptyLineIndex = lines.findIndex(
        (line) => line.trim().length > 0,
      );
      return lines.slice(firstNonEmptyLineIndex).join('\r\n');
    })
    /// Filter out empty suggestions.
    .filter((generatedSuggestion) => generatedSuggestion.length > 0);

  switch (completionType) {
    case CompletionType.Function: {
      return result;
    }
    case CompletionType.Line: {
      return result.map((suggestion) => suggestion.split('\r\n')[0].trimEnd());
    }
    case CompletionType.Snippet: {
      return result
        .map((suggestion) => {
          const lines = suggestion.split('\r\n').slice(0, 5);
          const lastNonEmptyLineIndex = lines.findLastIndex(
            (line) => line.trim().length > 0,
          );
          if (lastNonEmptyLineIndex < 0) {
            return '';
          }
          return lines
            .slice(0, Math.min(4, lastNonEmptyLineIndex + 1))
            .join('\r\n');
        })
        .filter((suggestion) => suggestion.length > 0);
    }
  }
};
