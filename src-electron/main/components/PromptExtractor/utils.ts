import { deleteComments } from 'main/utils/common';
import { NEW_LINE_REGEX } from 'shared/constants/common';
import { CompletionType } from 'shared/types/common';

export const calculateFunctionPrefix = (input: string): string => {
  const lines = input.split(NEW_LINE_REGEX);
  const lastCommentEndLine = lines.findLastIndex((line) =>
    /^\/\/.*|^\S+.*?\*\/\s*$/.test(line),
  );
  if (lastCommentEndLine !== -1) {
    return lines.slice(lastCommentEndLine + 1).join('\n');
  }
  return input;
};

export const calculateFunctionSuffix = (input: string): string => {
  const lines = input.split(NEW_LINE_REGEX);
  const firstFunctionEndLine = lines.findIndex((line) => /^}\S*/.test(line));
  if (firstFunctionEndLine !== -1) {
    return lines.slice(0, firstFunctionEndLine + 1).join('\n');
  }
  const firstCommentStartLine = lines.findIndex((line) => /^\/\*.*/.test(line));
  if (firstCommentStartLine !== -1) {
    return lines.slice(0, firstCommentStartLine).join('\n');
  }
  return input;
};

export const removeFunctionHeader = (
  input: string,
  completionType: CompletionType,
): string =>
  completionType === CompletionType.Function
    ? input
    : input.replaceAll(/\/\*\*(?:(?!.*\*\/)[^\n]*\n){5,}?[\s\S]*?\*\*\//g, '');

export const separateTextByLine = (
  rawText: string,
  removeComments = false,
): string[] => {
  if (removeComments) {
    rawText = deleteComments(rawText);
  }
  return rawText
    .split(NEW_LINE_REGEX)
    .filter((tabContentLine) => tabContentLine.trim().length > 0);
};
