import { extname } from 'path';

import { PromptElements } from 'main/components/PromptExtractor/types';
import { CompletionType } from 'shared/types/common';

// Start with '//' or '#' or '{' or '/*', or is '***/'
const detectRegex = /^\/\/|^#|^\{|^\/\*|^\*+\/$/;

// 后文去重
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
