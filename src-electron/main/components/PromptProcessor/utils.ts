import { extname } from 'path';

import { PromptElements } from 'main/components/PromptExtractor/types';
import { NEW_LINE_REGEX } from 'shared/constants/common';
import { CompletionType } from 'shared/types/common';
import completionLog from 'main/components/Loggers/completionLog';

// Start with '//', '#', '{', '/**' or end with '**/'
const functionHeaderEndRegex = /^\/\/|^#|^\{|^\/\*\*|\*\*\/\s*$/;
// Line that only have (part of) comment
const pureCommentRegex = /^\s*\/\/|\*\/\s*$/;

export const getCompletionType = (
  promptElements: PromptElements,
): CompletionType => {
  if (
    (promptElements.fullPrefix.split(NEW_LINE_REGEX).at(-1) ?? '').trim()
      .length > 0
  ) {
    return CompletionType.Line;
  }

  const lastNonEmptyLine =
    promptElements.fullPrefix.trimEnd().split(NEW_LINE_REGEX).at(-1) ?? '';
  completionLog.debug('getCompletionType', {
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
  prefix: string,
): string[] => {
  // TODO: Replace Date Created if needed.
  // 2024-10-15 Remove switch statement
  // switch (completionType) {
  //   case CompletionType.Snippet:
  //   case CompletionType.Function: {
  //     return result;
  //   }
  //   case CompletionType.Line: {
  //     return result.map((suggestion) =>
  //       suggestion.split(NEW_LINE_REGEX)[0].trimEnd(),
  //     );
  //   }
  // }

  return (
    generatedSuggestions
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
      /// Remove end empty lines
      .map((generatedSuggestion) => {
        return generatedSuggestion.trimEnd();
      })
      /// Filter out empty suggestions.
      .filter((generatedSuggestion) => generatedSuggestion.length > 0)
  );
};
