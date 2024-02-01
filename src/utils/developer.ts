export const IGNORE_COMWARE_INTERNAL = new Set([
  //* Comware Macros *//
  'DBGASSERT',
  'IN',
  'INLINE',
  'INOUT',
  'ISSU',
  'NOINLSTATIC',
  'OUT',
  'STATIC',
  'STATICASSERT',
  //* Comware Naming Standards *//
  'E', //? Enum
  'S', //? Struct
  'T', //? Typedef
]);
export const IGNORE_COMMON_WORD = new Set([
  'a',
  'about',
  'above',
  'after',
  'again',
  'all',
  'an',
  'and',
  'any',
  'are',
  'as',
  'at',
  'be',
  'because',
  'been',
  'before',
  'being',
  'below',
  'between',
  'both',
  'but',
  'by',
  'can',
  'did',
  'do',
  'does',
  'doing',
  'don',
  'down',
  'during',
  'each',
  'few',
  'from',
  'further',
  'had',
  'has',
  'have',
  'having',
  'here',
  'how',
  'in',
  'into',
  'is',
  'it',
  'its',
  'just',
  'more',
  'most',
  'no',
  'not',
  'now',
  'of',
  'off',
  'on',
  'once',
  'only',
  'or',
  'other',
  'our',
  'out',
  'over',
  'own',
  's',
  'same',
  'should',
  'so',
  'some',
  'such',
  't',
  'than',
  'that',
  'the',
  'their',
  'them',
  'then',
  'there',
  'these',
  'they',
  'this',
  'those',
  'through',
  'to',
  'too',
  'under',
  'until',
  'up',
  'very',
  'was',
  'we',
  'were',
  'what',
  'when',
  'where',
  'which',
  'who',
  'why',
  'will',
  'would',
  'you',
]);
export const IGNORE_RESERVED_KEYWORDS = new Set([
  'assert',
  'break',
  'case',
  'catch',
  'class',
  'const',
  'continue',
  'def',
  'else',
  'enum',
  'finally',
  'for',
  'function',
  'if',
  'import',
  'match',
  'new',
  'raise',
  'repeat',
  'return',
  'static',
  'struct',
  'super',
  'switch',
  'then',
  'this',
  'TODO',
  'try',
  'var',
  'while',
  'with',
]);
const REGEXP_WORD = /[^a-zA-Z0-9]/;

export interface SimilarSnippet {
  path: string;
  score: number;
  line: number;
  content: string;
}

export const tokenize = (
  rawText: string,
  ignoreRules: Array<Set<string>>,
  splitPattern: RegExp = REGEXP_WORD
): Set<string> => {
  let tokens = rawText.split(splitPattern).filter((token) => token.length > 0);
  ignoreRules.forEach(
    (ignoreRule) => (tokens = tokens.filter((token) => !ignoreRule.has(token)))
  );
  return new Set(tokens);
};
export const getMostSimilarSnippetStartLine = (
  candidateTokens: Array<Set<string>>,
  referenceTokens: Set<string>,
  windowSize: number
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
          Array<string>()
        )
    );

    const intersectionTokens = new Set(
      [...windowedCandidateTokens].filter((targetToken) =>
        referenceTokens.has(targetToken)
      )
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
