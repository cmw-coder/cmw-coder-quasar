import { promises } from 'fs';
import { basename, dirname } from 'path';

import {
  IGNORE_COMMON_WORD,
  IGNORE_COMWARE_INTERNAL,
  IGNORE_RESERVED_KEYWORDS,
} from 'main/components/PromptExtractor/constants';
import {
  PromptElements,
  RelativeDefinition,
  SimilarSnippet,
  SimilarSnippetConfig,
} from 'main/components/PromptExtractor/types';
import {
  getAllOtherTabContents,
  getMostSimilarSnippetStartLine,
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
  private readonly _project: string;
  private _similarSnippetConfig: SimilarSnippetConfig = {
    contextLines: 30,
    limit: 5,
    minScore: 0.45,
  };

  constructor(project: string, document: TextDocument, position: Position) {
    this._document = document;
    this._position = position;
    this._project = project;
  }

  async getPromptComponents(
    prefix: string,
    recentFiles: string[],
    suffix: string,
    symbols: SymbolInfo[],
    similarSnippetCount = 1
  ): Promise<PromptElements> {
    const promptElements = new PromptElements(prefix, suffix);
    promptElements.language = this._document.languageId;

    const relativePath = this._document.fileName.substring(this._project.length);
    promptElements.file = basename(relativePath);
    promptElements.folder = dirname(relativePath);

    recentFiles = recentFiles.filter(
      (fileName) => fileName !== this._document.fileName
    );

    const [allMostSimilarSnippets, relativeDefinitions] = await Promise.all([
      this._getSimilarSnippets(prefix, suffix, recentFiles),
      this._getRelativeDefinitions(symbols),
    ]);

    const mostSimilarSnippets = allMostSimilarSnippets
      .slice(0, similarSnippetCount)
      .filter(
        (mostSimilarSnippet) =>
          mostSimilarSnippet.score > this._similarSnippetConfig.minScore
      );

    console.log({
      minScore: this._similarSnippetConfig.minScore,
      mostSimilarSnippets,
    });

    if (mostSimilarSnippets.length) {
      promptElements.similarSnippet = mostSimilarSnippets
        .map((mostSimilarSnippet) => mostSimilarSnippet.content)
        .join('\r\n');
    }

    if (relativeDefinitions.length) {
      const remainingCharacters =
        6000 -
        promptElements.file.length -
        promptElements.folder.length -
        promptElements.language.length -
        promptElements.prefix.length -
        (promptElements.similarSnippet?.length ?? 0) -
        promptElements.suffix.length;
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
      promptElements.symbols = relativeDefinitionsTruncated
        .map((relativeDefinition) => relativeDefinition.content)
        .join('\r\n');
    }

    return promptElements;
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
