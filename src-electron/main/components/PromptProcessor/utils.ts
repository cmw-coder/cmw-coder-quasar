import log from 'electron-log/main';
import { extname } from 'path';

import { PromptElements } from 'main/components/PromptExtractor/types';
import { NEW_LINE_REGEX } from 'shared/constants/common';
import { CompletionType } from 'shared/types/common';

// Start with '//', '#', '{', '/**' or end with '**/'
const functionHeaderEndRegex = /^\/\/|^#|^\{|^\/\*\*|\*\*\/\s*$/;
// Line that only have (part of) comment
const pureCommentRegex = /^\s*\/\/|\*\/\s*$/;

export const getCompletionType = (
  promptElements: PromptElements,
): CompletionType => {
  if (
    (promptElements.prefix.split(NEW_LINE_REGEX).at(-1) ?? '').trim().length > 0
  ) {
    return CompletionType.Line;
  }

  const lastNonEmptyLine =
    promptElements.prefix.trimEnd().split(NEW_LINE_REGEX).at(-1) ?? '';
  log.debug('getCompletionType', {
    lastNonEmptyLine,
    functionHeaderEndTest: functionHeaderEndRegex.test(lastNonEmptyLine),
    extension: extname(promptElements.file ?? ''),
  });
  if (
    functionHeaderEndRegex.test(lastNonEmptyLine) &&
    extname(promptElements.file ?? '') !== 'h'
  ) {
    return CompletionType.Function;
  }

  if (
    pureCommentRegex.test(lastNonEmptyLine) ||
    promptElements.similarSnippet
  ) {
    return CompletionType.Snippet;
  }

  return CompletionType.Line;
};

export const processGeneratedSuggestions = (
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
    /// Use '\n' as new line separator.
    .map((generatedSuggestion) =>
      generatedSuggestion.replace(NEW_LINE_REGEX, '\n'),
    )
    /// Filter out leading empty lines.
    .map((generatedSuggestion) => {
      const lines = generatedSuggestion.split('\n');
      const firstNonEmptyLineIndex = lines.findIndex(
        (line) => line.trim().length > 0,
      );
      return lines.slice(firstNonEmptyLineIndex).join('\n');
    })
    /// Filter out empty suggestions.
    .filter((generatedSuggestion) => generatedSuggestion.length > 0);

  switch (completionType) {
    case CompletionType.Snippet:
    case CompletionType.Function: {
      return result;
    }
    case CompletionType.Line: {
      return result.map((suggestion) =>
        suggestion.split(NEW_LINE_REGEX)[0].trimEnd(),
      );
    }
    // case CompletionType.Snippet: {
    //   return result
    //     .map((suggestion) => {
    //       const lines = suggestion.split(NEW_LINE_REGEX).slice(0, 5);
    //       const lastNonEmptyLineIndex = lines.findLastIndex(
    //         (line) => line.trim().length > 0,
    //       );
    //       if (lastNonEmptyLineIndex < 0) {
    //         return '';
    //       }
    //       return lines
    //         .slice(0, Math.min(4, lastNonEmptyLineIndex + 1))
    //         .join('\n');
    //     })
    //     .filter((suggestion) => suggestion.length > 0);
    // }
  }
};
