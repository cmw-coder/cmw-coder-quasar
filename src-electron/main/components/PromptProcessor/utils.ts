import escapeStringRegexp from 'escape-string-regexp';

import { PromptComponents } from 'main/components/PromptExtractor/types';
import {
  HuggingFaceModelConfigType,
  LinseerModelConfigType,
  SeparateTokens,
} from 'main/stores/config/types';
import { generate, generateRd } from 'main/utils/axios';
import { Completion } from 'main/components/PromptProcessor/types';

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
): Promise<Completion[]> => {
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
  const generatedSuggestions: string[] = [];
  if (best_of_sequences && best_of_sequences.length) {
    generatedSuggestions.push(
      ...best_of_sequences.map((bestOfSequence) =>
        isSnippet
          ? bestOfSequence.generated_text
          : bestOfSequence.generated_text.trimStart()
      )
    );
  } else {
    generatedSuggestions.push(
      isSnippet ? generated_text : generated_text.trimStart()
    );
  }

  return _processGeneratedSuggestions(
    promptComponents.prefix,
    separateTokens,
    completionConfig.stopTokens,
    generatedSuggestions,
    isSnippet
  );
};

export const processLinseerApi = async (
  modelConfig: LinseerModelConfigType,
  accessToken: string,
  promptComponents: PromptComponents,
  isSnippet: boolean,
  projectId: string
): Promise<Completion[]> => {
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

  return _processGeneratedSuggestions(
    promptComponents.prefix,
    undefined,
    completionConfig.stopTokens,
    generatedSuggestions,
    isSnippet
  );
};

const _processGeneratedSuggestions = (
  promptString: string,
  separateTokens: SeparateTokens | undefined,
  stopTokens: string[],
  generatedSuggestions: string[],
  isSnippet: boolean
): Completion[] => {
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
      /// Replace line breaks with '\\r\\n'.
      .map((generatedSuggestion) =>
        generatedSuggestion.replace(/\r\n|\n/g, '\\r\\n')
      )
      /// Construct the final suggestions.
      .map((generatedSuggestion) => ({
        isSnippet,
        content: isSnippet
          ? generatedSuggestion
          : generatedSuggestion.split('\\r\\n')[0].trimEnd(),
      }))
  );
};
