import log from 'electron-log/main';
import { existsSync, promises } from 'fs';
import { decode } from 'iconv-lite';

import { REGEXP_WORD } from 'main/components/PromptExtractor/constants';
import { TextDocument } from 'main/types/TextDocument';
import { Position } from 'main/types/vscode/position';
import { NEW_LINE_REGEX } from 'shared/constants/common';

const { readFile } = promises;

export const getFunctionPrefix = (input: string): string | undefined => {
  const lines = input.split(NEW_LINE_REGEX);
  const lastValidCodeLine = lines.findLastIndex((line) =>
    /^\/\/.*|^\S+.*?\*\/\s*$/.test(line),
  );
  if (lastValidCodeLine !== -1) {
    return lines.slice(lastValidCodeLine + 1).join('\n');
  }
};

export const getFunctionSuffix = (input: string): string | undefined => {
  const lines = input.split(NEW_LINE_REGEX);
  const firstFunctionEndLine = lines.findIndex((line) =>
    /^}\S*/.test(line),
  );
  if (firstFunctionEndLine !== -1) {
    return lines.slice(0, firstFunctionEndLine + 1).join('\n');
  }
  const firstFunctionStartLine = lines.findIndex((line) =>
    /^\/\*.*/.test(line),
  );
  if (firstFunctionStartLine !== -1) {
    return lines.slice(0, firstFunctionStartLine).join('\n');
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
  log.debug('getRemainedCodeContents', {
    before: rawText.substring(
      document.offsetAt(position) - prefix.length - 1000,
      document.offsetAt(position) - prefix.length,
    ),
    after: rawText.substring(
      document.offsetAt(position) + suffix.length,
      document.offsetAt(position) + suffix.length + 1000,
    ),
    offsetAt: document.offsetAt(position),
    prefixLength: prefix.length,
    suffixLength: suffix.length,
  });

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
