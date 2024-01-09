import escapeStringRegexp from 'escape-string-regexp';

import { PromptElements } from 'main/components/PromptExtractor/types';
import {
  HuggingFaceModelConfigType,
  LinseerModelConfigType,
  SeparateTokens,
} from 'main/stores/config/types';
import { generate, generateRd } from 'main/utils/axios';
import { Completions, CompletionType } from 'shared/types/common';

// Start with '//' or '#', or end with '{' or '*/'
const detectRegex = /^(\/\/|#)|(\{|\*\/)$/;

export const getCompletionType = (
  promptElements: PromptElements
): CompletionType => {
  const lastLine = promptElements.prefix.trimEnd().split('\r\n').at(-1) ?? '';
  if (detectRegex.test(lastLine.trim())) {
    return CompletionType.Function;
  }
  if (promptElements.similarSnippet && promptElements.symbols) {
    return CompletionType.Snippet;
  }
  return CompletionType.Line;
};

export const processHuggingFaceApi = async (
  modelConfig: HuggingFaceModelConfigType,
  promptElements: PromptElements,
  completionType: CompletionType
): Promise<Completions> => {
  const { completionConfigs, separateTokens } = modelConfig;
  const completionConfig =
    completionType === CompletionType.Function
      ? completionConfigs.function
      : completionType === CompletionType.Line
      ? completionConfigs.line
      : completionConfigs.snippet;
  const { endpoint, maxTokenCount, stopTokens, suggestionCount, temperature } =
    completionConfig;

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

  return {
    contents: _processGeneratedSuggestions(
      generatedSuggestions,
      completionType,
      promptElements.constructQuestion(),
      separateTokens,
      completionConfig.stopTokens
    ),
    type: completionType,
  };
};

export const processLinseerApi = async (
  modelConfig: LinseerModelConfigType,
  accessToken: string,
  promptElements: PromptElements,
  completionType: CompletionType,
  projectId: string
): Promise<Completions> => {
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

  return {
    contents: _processGeneratedSuggestions(
      generatedSuggestions,
      completionType,
      promptElements.constructQuestion(),
      undefined,
      completionConfig.stopTokens
    ),
    type: completionType,
  };
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
    /// Filter out leading empty lines.
    .map((generatedSuggestion) => {
      const lines = generatedSuggestion.split('\n');
      const firstNonEmptyLineIndex = lines.findIndex(
        (line) => line.trim().length > 0
      );
      return lines.slice(firstNonEmptyLineIndex).join('\n');
    })
    /// Filter out empty suggestions.
    .filter((generatedSuggestion) => generatedSuggestion.length > 0)
    /// Replace '\t' with 4 spaces.
    .map((generatedSuggestion) =>
      generatedSuggestion.replace(/\t/g, ' '.repeat(4))
    )
    /// Replace '\n' with '\r\n'.
    .map((generatedSuggestion) =>
      generatedSuggestion.replace(/\r?\n/g, '\r\n')
    );
  return completionType === CompletionType.Function
    ? result
    : completionType === CompletionType.Line
    ? result.map((suggestion) => suggestion.split('\r\n')[0])
    : result.map((suggestion) =>
        suggestion.split('\r\n').slice(0, 3).join('\r\n')
      );
};
