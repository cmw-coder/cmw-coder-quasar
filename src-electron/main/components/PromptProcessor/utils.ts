import escapeStringRegexp from 'escape-string-regexp';

import { PromptElements } from 'main/components/PromptExtractor/types';
import {
  HuggingFaceModelConfigType,
  LinseerModelConfigType,
  SeparateTokens,
} from 'main/stores/config/types';
import { generate, generateRd } from 'main/utils/axios';
import { CompletionType } from 'shared/types/common';

// Start with '//' or '#' or '{' or '/*'
const detectRegex = /^((\/\/)|(#)|(\{)|(\/\*))$/;

export const getCompletionType = (
  promptElements: PromptElements
): CompletionType => {
  const lastLine = promptElements.prefix.split('\r\n').at(-1) ?? '';
  if (lastLine.trim().length > 0) {
    return CompletionType.Line;
  }

  const lastNonEmptyLine =
    promptElements.prefix.trimEnd().split('\r\n').at(-1) ?? '';
  if (detectRegex.test(lastNonEmptyLine)) {
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
  completionType: CompletionType
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

  console.log('processHuggingFaceApi', {
    inputs: promptElements.stringify(separateTokens),
    parameters: {
      best_of: suggestionCount,
      details: true,
      do_sample: true,
      max_new_tokens: maxTokenCount,
      stop: stopTokens,
      temperature: temperature,
      top_p: 0.95,
    },
  });

  const {
    data: {
      details: { best_of_sequences },
      generated_text,
    },
  } = await generate(endpoint, {
    inputs: promptElements.stringify(separateTokens),
    parameters: {
      best_of: suggestionCount,
      details: true,
      do_sample: true,
      max_new_tokens: maxTokenCount,
      stop: stopTokens,
      temperature: temperature,
      top_p: 0.95,
    },
  });
  let generatedSuggestions: string[] = [];
  if (best_of_sequences && best_of_sequences.length) {
    generatedSuggestions = best_of_sequences.map(
      (bestOfSequence) => bestOfSequence.generated_text
    );
  } else {
    generatedSuggestions.push(generated_text);
  }

  return _processGeneratedSuggestions(
    generatedSuggestions,
    completionType,
    promptElements.constructQuestion(),
    separateTokens,
    completionConfig.stopTokens
  );
};

export const processLinseerApi = async (
  modelConfig: LinseerModelConfigType,
  accessToken: string,
  promptElements: PromptElements,
  completionType: CompletionType,
  projectId: string
): Promise<string[]> => {
  const { completionConfigs, endpoint } = modelConfig;
  const completionConfig =
    completionType === CompletionType.Function
      ? completionConfigs.function
      : completionType === CompletionType.Line
      ? completionConfigs.line
      : completionConfigs.snippet;
  const { maxTokenCount, stopTokens, subModelType, temperature } =
    completionConfig;

  const generatedSuggestions = (
    await generateRd(
      endpoint,
      {
        question: promptElements.constructQuestion(),
        model: subModelType,
        maxTokens: maxTokenCount,
        temperature: temperature,
        stop: stopTokens,
        suffix: promptElements.suffix,
        plugin: 'SI',
        profileModel: '百业灵犀-13B',
        templateName:
          completionType === CompletionType.Line ? 'ShortLineCode' : 'LineCode',
        subType: projectId,
      },
      accessToken
    )
  ).data
    .map((item) => item.text)
    .filter((completion) => completion.trim().length > 0);

  return  _processGeneratedSuggestions(
    generatedSuggestions,
    completionType,
    promptElements.constructQuestion(),
    undefined,
    completionConfig.stopTokens
  );
};

const _processGeneratedSuggestions = (
  generatedSuggestions: string[],
  completionType: CompletionType,
  promptQuestion: string,
  separateTokens: SeparateTokens | undefined,
  stopTokens: string[]
): string[] => {
  // TODO: Replace Date Created if needed.
  const result = generatedSuggestions
    /// Filter out contents that are the same as the prompt.
    .map((generatedSuggestion) =>
      generatedSuggestion.substring(0, promptQuestion.length) === promptQuestion
        ? generatedSuggestion.substring(promptQuestion.length)
        : generatedSuggestion
    )
    /// Filter out contents that are the same as the stop tokens.
    .map((generatedSuggestion) => {
      const combinedTokens = [...stopTokens];
      if (separateTokens) {
        const { start, end, middle } = separateTokens;
        combinedTokens.push(start, end, middle);
      }
      const regExp = `(${combinedTokens
        .map((token) => escapeStringRegexp(token))
        .join('|')})`;
      return generatedSuggestion.replace(new RegExp(regExp, 'g'), '');
    })
    /// Replace '\t' with 4 spaces.
    .map((generatedSuggestion) =>
      generatedSuggestion.replace(/\t/g, ' '.repeat(4))
    )
    /// Replace '\r' or '\n' with '\r\n'.
    .map((generatedSuggestion) =>
      generatedSuggestion.replace(/\r\n?/g, '\r\n').replace(/\r?\n/g, '\r\n')
    )
    /// Filter out leading empty lines.
    .map((generatedSuggestion) => {
      const lines = generatedSuggestion.split('\r\n');
      const firstNonEmptyLineIndex = lines.findIndex(
        (line) => line.trim().length > 0
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
          const lines = suggestion.split('\r\n').slice(0, 4);
          const lastNonEmptyLineIndex = lines.findLastIndex(
            (line) => line.trim().length > 0
          );
          if (lastNonEmptyLineIndex < 0) {
            return '';
          }
          return lines
            .slice(0, Math.min(3, lastNonEmptyLineIndex + 1))
            .join('\r\n');
        })
        .filter((suggestion) => suggestion.length > 0);
    }
  }
};
