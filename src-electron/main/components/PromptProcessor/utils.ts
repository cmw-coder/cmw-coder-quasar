import escapeStringRegexp from 'escape-string-regexp';

import { PromptComponents } from 'main/components/PromptExtractor/types';
import {
  HuggingFaceModelConfigType,
  LinseerModelConfigType,
  SeparateTokens,
} from 'main/stores/config/types';
import { generate, generateRd } from 'main/utils/axios';
import { Completions, CompletionType } from 'shared/types/common';

// Start with '//' or '#', or end with '{' or '*/'
const detectRegex = /^(\/\/|#)|(\{|\*\/)$/;

export const checkIsSnippet = (prefix: string): boolean => {
  const lastLine = prefix.trimEnd().split('\n').at(-1) ?? '';
  return detectRegex.test(lastLine) && lastLine == lastLine.trimStart();
};

export const getPromptString = (
  promptComponents: PromptComponents,
  separateTokens: SeparateTokens
): string => {
  const { start, end, middle } = separateTokens;
  const result = [];

  if (promptComponents.reponame.length) {
    result.push(`<reponame>${promptComponents.reponame}`);
  }
  if (promptComponents.filename.length) {
    result.push(`<filename>${promptComponents.filename}`);
  }
  result.push(start + promptComponents.prefix);
  result.push(end + promptComponents.suffix);
  result.push(middle);
  return result.join('');
};

export const processHuggingFaceApi = async (
  modelConfig: HuggingFaceModelConfigType,
  promptComponents: PromptComponents,
  isSnippet: boolean
): Promise<Completions> => {
  const { completionConfigs, separateTokens } = modelConfig;
  const completionConfig = isSnippet
    ? completionConfigs.snippet
    : completionConfigs.line;
  const { endpoint, maxTokenCount, stopTokens, suggestionCount, temperature } =
    completionConfig;

  const {
    data: {
      details: { best_of_sequences },
      generated_text,
    },
  } = await generate(endpoint, {
    inputs: getPromptString(promptComponents, separateTokens),
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
      promptComponents.prefix,
      separateTokens,
      completionConfig.stopTokens,
      generatedSuggestions
    ),
    type: isSnippet ? CompletionType.Snippet : CompletionType.Line,
  };
};

export const processLinseerApi = async (
  modelConfig: LinseerModelConfigType,
  accessToken: string,
  promptComponents: PromptComponents,
  isSnippet: boolean,
  projectId: string
): Promise<Completions> => {
  const { completionConfigs, endpoint } = modelConfig;
  const completionConfig = isSnippet
    ? completionConfigs.snippet
    : completionConfigs.line;
  const { maxTokenCount, stopTokens, subModelType, temperature } =
    completionConfig;

  const generatedSuggestions = (
    await generateRd(
      endpoint,
      {
        question: promptComponents.prefix,
        model: subModelType,
        maxTokens: maxTokenCount,
        temperature: temperature,
        stop: stopTokens,
        suffix: promptComponents.suffix,
        plugin: 'SI',
        profileModel: '百业灵犀-13B',
        templateName: isSnippet ? 'LineCode' : 'ShortLineCode',
        subType: projectId,
      },
      accessToken
    )
  ).data
    .map((item) => item.text)
    .filter((completion) => completion.trim().length > 0);

  return {
    contents: _processGeneratedSuggestions(
      promptComponents.prefix,
      undefined,
      completionConfig.stopTokens,
      generatedSuggestions
    ),
    type: isSnippet ? CompletionType.Snippet : CompletionType.Line,
  };
};

const _processGeneratedSuggestions = (
  promptString: string,
  separateTokens: SeparateTokens | undefined,
  stopTokens: string[],
  generatedSuggestions: string[]
): string[] => {
  // TODO: Replace Date Created if needed.
  return (
    generatedSuggestions
      /// Filter out contents that are the same as the prompt.
      .map((generatedSuggestion) =>
        generatedSuggestion.substring(0, promptString.length) === promptString
          ? generatedSuggestion.substring(promptString.length)
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
      )
  );
};
