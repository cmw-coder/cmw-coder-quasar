import { existsSync, promises } from 'fs';
import { decode } from 'iconv-lite';

import { REGEXP_WORD } from 'main/components/PromptExtractor/constants';
import { TextDocument } from 'main/types/TextDocument';
import { Position } from 'main/types/vscode/position';
import { NEW_LINE_REGEX } from 'shared/constants/common';
import { CompletionType } from 'shared/types/common';

const { readFile } = promises;

export const getBoundingPrefix = (input: string): string | undefined => {
  const lines = input.split(NEW_LINE_REGEX);
  const firstCommentEndLine = lines.findIndex((line) =>
    /^\/\/.*|^\S+.*?\*\/\s*$/.test(line),
  );
  if (firstCommentEndLine !== -1) {
    return lines.slice(firstCommentEndLine + 1).join('\n');
  }
};

export const getBoundingSuffix = (input: string): string | undefined => {
  const lines = input.split(NEW_LINE_REGEX);
  const lastFunctionEndLine = lines.findLastIndex((line) => /^}\S*/.test(line));
  if (lastFunctionEndLine !== -1) {
    return lines.slice(0, lastFunctionEndLine + 1).join('\n');
  }
  const lastCommentStartLine = lines.findLastIndex((line) =>
    /^\/\*.*/.test(line),
  );
  if (lastCommentStartLine !== -1) {
    return lines.slice(0, lastCommentStartLine).join('\n');
  }
};

export const getFunctionPrefix = (input: string): string | undefined => {
  const lines = input.split(NEW_LINE_REGEX);
  const lastCommentEndLine = lines.findLastIndex((line) =>
    /^\/\/.*|^\S+.*?\*\/\s*$/.test(line),
  );
  if (lastCommentEndLine !== -1) {
    return lines.slice(lastCommentEndLine + 1).join('\n');
  }
};

export const getFunctionSuffix = (input: string): string | undefined => {
  const lines = input.split(NEW_LINE_REGEX);
  const firstFunctionEndLine = lines.findIndex((line) => /^}\S*/.test(line));
  if (firstFunctionEndLine !== -1) {
    return lines.slice(0, firstFunctionEndLine + 1).join('\n');
  }
  const firstCommentStartLine = lines.findIndex((line) =>
    /^\/\*.*/.test(line),
  );
  if (firstCommentStartLine !== -1) {
    return lines.slice(0, firstCommentStartLine).join('\n');
  }
};

export const getAllOtherTabContents = async (
  tabPaths: string[],
): Promise<{ path: string; content: string }[]> => {
  return (
    await Promise.all(
      tabPaths
        .filter((tabPath) => existsSync(tabPath))
        .map((tabPath) => readFile(tabPath)),
    )
  ).map((tabContent, index) => ({
    path: tabPaths[index],
    content: decode(tabContent, 'gb2312'),
  }));
};

export const getRemainedCodeContents = (
  document: TextDocument,
  position: Position,
  prefix: string,
  suffix: string,
): {
  before: string[];
  after: string[];
} => {
  const rawText = document.getText();
  return {
    before: separateTextByLine(
      rawText.substring(0, document.offsetAt(position) - prefix.length),
      true,
    ),
    after: separateTextByLine(
      rawText.substring(document.offsetAt(position) + suffix.length),
      true,
    ),
  };
};

export const removeFunctionHeader = (
  input: string,
  completionType: CompletionType,
): string =>
  completionType === CompletionType.Function
    ? input
    : input.replaceAll(/\/\*{2,}(.*?\n.*?){5,}?.*\*{2,}\//g, '');

export const separateTextByLine = (
  rawText: string,
  removeComments = false,
): string[] => {
  if (removeComments) {
    rawText = rawText.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
  }
  return rawText
    .split(NEW_LINE_REGEX)
    .filter((tabContentLine) => tabContentLine.trim().length > 0);
};

export const tokenize = (
  rawText: string,
  ignoreRules: Array<Set<string>>,
  splitPattern: RegExp = REGEXP_WORD,
): Set<string> => {
  let tokens = rawText.split(splitPattern).filter((token) => token.length > 0);
  ignoreRules.forEach(
    (ignoreRule) => (tokens = tokens.filter((token) => !ignoreRule.has(token))),
  );
  return new Set(tokens);
};

export const getMostSimilarSnippetStartLine = (
  candidateTokens: Array<Set<string>>,
  referenceTokens: Set<string>,
  windowSize: number,
): {
  startLine: number;
  score: number;
} => {
  const currentMostSimilar = {
    startLine: 0,
    score: 0,
  };

  for (
    let startLineIndex = 0;
    startLineIndex + windowSize < candidateTokens.length;
    startLineIndex++
  ) {
    const windowedCandidateTokens = new Set(
      candidateTokens
        .slice(startLineIndex, startLineIndex + windowSize)
        .reduce(
          (accumulatedTokens, targetLineTokens) =>
            accumulatedTokens.concat([...targetLineTokens]),
          Array<string>(),
        ),
    );

    const intersectionTokens = new Set(
      [...windowedCandidateTokens].filter((targetToken) =>
        referenceTokens.has(targetToken),
      ),
    );

    const currentScore =
      intersectionTokens.size /
      (windowedCandidateTokens.size +
        referenceTokens.size -
        intersectionTokens.size);
    if (currentScore > currentMostSimilar.score) {
      currentMostSimilar.startLine = startLineIndex;
      currentMostSimilar.score = currentScore;
    }
  }
  return currentMostSimilar;
};
