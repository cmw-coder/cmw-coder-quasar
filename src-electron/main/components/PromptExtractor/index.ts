import { promises } from 'fs';
import { basename, dirname } from 'path';

import {
  IGNORE_COMMON_WORD,
  IGNORE_COMWARE_INTERNAL,
  IGNORE_RESERVED_KEYWORDS,
} from 'main/components/PromptExtractor/constants';
import {
  PromptComponents,
  PromptElement,
  PromptType,
  RelativeDefinition,
  SimilarSnippet,
  SimilarSnippetConfig,
} from 'main/components/PromptExtractor/types';
import {
  getAllOtherTabContents,
  getMostSimilarSnippetStartLine,
  getRelativePath,
  separateTextByLine,
  tokenize,
} from 'main/components/PromptExtractor/utils';
import { SymbolInfo } from 'main/types/SymbolInfo';
import { TextDocument } from 'main/types/TextDocument';
import { Position } from 'main/types/vscode/position';

const { readFile } = promises;

export class PromptExtractor {
  private _document: TextDocument;
  private readonly _position: Position;
  private _similarSnippetConfig: SimilarSnippetConfig = {
    contextLines: 30,
    limit: 5,
    minScore: 0.25,
  };

  constructor(document: TextDocument, position: Position) {
    this._document = document;
    this._position = position;
  }

  async getPromptComponents(
    openedTabs: string[],
    symbols: SymbolInfo[],
    beforeCursor: string,
    afterCursor: string,
    similarSnippetCount = 1
  ): Promise<PromptComponents> {
    const prefixElements = Array<PromptElement>();
    const result: PromptComponents = {
      reponame: '',
      filename: '',
      prefix: '',
      suffix: afterCursor,
    };

    prefixElements.push({
      type: PromptType.LanguageMarker,
      priority: 1,
      value: `Language: ${this._document.languageId}`,
    });

    const relativePath = getRelativePath(this._document.fileName);
    result.reponame = dirname(relativePath);
    result.filename = basename(relativePath);

    const [allMostSimilarSnippets, relativeDefinitions] = await Promise.all([
      this._getSimilarSnippets(beforeCursor, afterCursor, openedTabs),
      this._getRelativeDefinitions(symbols),
    ]);

    const mostSimilarSnippets = allMostSimilarSnippets
      .slice(0, similarSnippetCount)
      .filter(
        (mostSimilarSnippet) =>
          mostSimilarSnippet.score > this._similarSnippetConfig.minScore
      );

    if (mostSimilarSnippets.length) {
      prefixElements.push({
        type: PromptType.SimilarFile,
        priority: 2,
        value:
          mostSimilarSnippets
            .map((mostSimilarSnippet) => mostSimilarSnippet.content)
            .join('\n') + '\n',
      });
    }

    prefixElements.push({
      type: PromptType.BeforeCursor,
      priority: 4,
      value: beforeCursor,
    });

    if (relativeDefinitions.length) {
      const remainingCharacters =
        6000 -
        result.reponame.length -
        result.filename.length -
        result.suffix.length -
        prefixElements.reduce(
          (accumulatedCharacters, prefixElement) =>
            accumulatedCharacters + prefixElement.value.length,
          0
        );
      const relativeDefinitionsTruncated = Array<RelativeDefinition>();
      let currentCharacters = 0;
      for (const relativeDefinition of relativeDefinitions) {
        if (
          currentCharacters + relativeDefinition.content.length <=
          remainingCharacters
        ) {
          relativeDefinitionsTruncated.push(relativeDefinition);
          currentCharacters += relativeDefinition.content.length;
        }
      }
      prefixElements.push({
        type: PromptType.ImportedFile,
        priority: 3,
        value:
          relativeDefinitionsTruncated
            .map((relativeDefinition) => relativeDefinition.content)
            .join('\n') + '\n',
      });
    }

    result.prefix = prefixElements
      .sort((first, second) => first.priority - second.priority)
      .map((prefixElement) => prefixElement.value)
      .join('\n\n');

    return result;
  }

  private async _getRelativeDefinitions(
    symbols: SymbolInfo[]
  ): Promise<RelativeDefinition[]> {
    return Promise.all(
      symbols.map(async ({ path, startLine, endLine }) => ({
        path,
        content: (
          await readFile(path, {
            flag: 'r',
          })
        )
          .toString()
          .split('\n')
          .slice(startLine, endLine + 1)
          .join('\n'),
      }))
    );
  }

  private async _getSimilarSnippets(
    beforeCursor: string,
    afterCursor: string,
    openedTabs: string[]
  ): Promise<SimilarSnippet[]> {
    const currentDocumentLines = this._getRemainedContents(
      beforeCursor,
      afterCursor
    );

    const tabLines = (await getAllOtherTabContents(openedTabs)).map(
      (tabContent) => ({
        path: tabContent.path,
        lines: separateTextByLine(tabContent.content, true),
      })
    );
    tabLines.push(
      {
        path: this._document.fileName,
        lines: currentDocumentLines.before,
      },
      {
        path: this._document.fileName,
        lines: currentDocumentLines.after,
      }
    );

    const mostSimilarSnippets = Array<SimilarSnippet>();

    tabLines.forEach(({ path, lines }) => {
      const { score, startLine } = getMostSimilarSnippetStartLine(
        lines.map((line) =>
          tokenize(line, [
            IGNORE_RESERVED_KEYWORDS,
            IGNORE_COMMON_WORD,
            IGNORE_COMWARE_INTERNAL,
          ])
        ),
        tokenize(beforeCursor, [
          IGNORE_RESERVED_KEYWORDS,
          IGNORE_COMMON_WORD,
          IGNORE_COMWARE_INTERNAL,
        ]),
        separateTextByLine(beforeCursor, true).length
      );
      const currentMostSimilarSnippet: SimilarSnippet = {
        path,
        score: score,
        content: lines
          .slice(
            startLine,
            startLine + separateTextByLine(beforeCursor, true).length + 10
          )
          .join('\n'),
      };

      mostSimilarSnippets.push(currentMostSimilarSnippet);
    });

    return mostSimilarSnippets
      .sort((first, second) => first.score - second.score)
      .reverse()
      .slice(0, this._similarSnippetConfig.limit);
  }

  private _getRemainedContents(
    beforeCursor: string,
    afterCursor: string
  ): {
    before: string[];
    after: string[];
  } {
    const rawText = this._document.getText();

    return {
      before: separateTextByLine(
        rawText.slice(
          0,
          this._document.offsetAt(this._position) - beforeCursor.length
        ),
        true
      ),
      after: separateTextByLine(
        rawText.slice(
          this._document.offsetAt(this._position) + afterCursor.length
        ),
        true
      ),
    };
  }
}
