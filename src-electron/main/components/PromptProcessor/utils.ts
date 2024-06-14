import { extname } from 'path';

import { PromptElements } from 'main/components/PromptExtractor/types';
import { NEW_LINE_REGEX } from 'shared/constants/common';
import { CompletionType } from 'shared/types/common';

// Start with '//' or '#' or '{' or '/*', or is '***/'
const functionHeaderEndRegex = /^\/\/|^#|^\{|^\/\*|^\*+\/$/;
// Line that only have (part of) comment
const pureCommentRegex = /^\s*\/\/|\*\/\s*$/;

export const completionsPostProcess = (
  completions: string[],
  promptElements: PromptElements,
) => {
  const lastPrefixLine = promptElements.prefix
    .split(NEW_LINE_REGEX)
    .filter((line) => line.trim().length)
    .at(-1);
  completions = completions.map((completion) => {
    const lines = completion.split(NEW_LINE_REGEX);
    const sameContentIndex = lines.findIndex((line) => line === lastPrefixLine);
    return sameContentIndex === -1
      ? completion
      : lines.slice(sameContentIndex).join('\n');
  });

  const firstSuffixLine = promptElements.suffix
    .split(NEW_LINE_REGEX)
    .filter((line) => line.trim().length)[0]
    .trimEnd();
  return completions.map((completion) => {
    const lines = completion.split(NEW_LINE_REGEX);
    const sameContentIndex = lines.findIndex(
      (line) => line.trimEnd() === firstSuffixLine,
    );
    return sameContentIndex === -1
      ? completion
      : lines.slice(0, sameContentIndex).join('\n');
  });
};

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
