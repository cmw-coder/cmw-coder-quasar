import {
  IGNORE_COMMON_WORD,
  IGNORE_COMWARE_INTERNAL,
  IGNORE_RESERVED_KEYWORDS,
} from 'main/components/PromptExtractor/constants';
import {
  PromptElements,
  RawInputs,
  SimilarSnippet,
  SimilarSnippetConfig,
} from 'main/components/PromptExtractor/types';
import {
  codeStripEnd,
  getAllOtherTabContents,
  getContentsAroundContext,
  getMostSimilarSnippetStartLine,
  separateTextByLine,
  tokenize,
} from 'main/components/PromptExtractor/utils';
import { TextDocument } from 'main/types/TextDocument';
import { Position } from 'main/types/vscode/position';
import { timer } from 'main/utils/timer';

export class PromptExtractor {
  private _similarSnippetConfig: SimilarSnippetConfig = {
    contextLines: 30,
    minScore: 0.45,
  };
  private _slowRecentFiles: string[] = [];

  async getPromptComponents(
    inputs: RawInputs,
    similarSnippetCount: number = 1,
  ): Promise<PromptElements> {
    const { elements, document, position, recentFiles } = inputs;
    timer.add('CompletionGenerate', 'CalculatedFileFolder');

    const [similarSnippets, relativeDefinitions] = await Promise.all([
      this._getSimilarSnippets(
        document,
        position,
        elements.prefix,
        elements.suffix,
        recentFiles,
      ),
      inputs.relativeDefinitions,
    ]);

    const similarSnippetsSliced = similarSnippets.slice(0, similarSnippetCount);
    console.log('PromptExtractor.getPromptComponents', {
      minScore: this._similarSnippetConfig.minScore,
      mostSimilarSnippets: similarSnippetsSliced,
    });

    if (similarSnippetsSliced.length) {
      elements.similarSnippet = similarSnippetsSliced
        .map((similarSnippet) => similarSnippet.content)
        .join('\r\n');
    }

    if (relativeDefinitions.length) {
      // const remainingCharacters =
      //   6000 -
      //   promptElements.file.length -
      //   promptElements.folder.length -
      //   promptElements.language.length -
      //   promptElements.prefix.length -
      //   (promptElements.similarSnippet?.length ?? 0) -
      //   promptElements.suffix.length;
      // const relativeDefinitionsTruncated = Array<RelativeDefinition>();
      // let currentCharacters = 0;
      // for (const relativeDefinition of relativeDefinitions) {
      //   if (
      //     currentCharacters + relativeDefinition.content.length <=
      //     remainingCharacters
      //   ) {
      //     relativeDefinitionsTruncated.push(relativeDefinition);
      //     currentCharacters += relativeDefinition.content.length;
      //   }
      // }

      elements.symbols = relativeDefinitions
        .map((relativeDefinition) => relativeDefinition.content)
        .join('\r\n');
    }

    return elements;
  }

  private async _getSimilarSnippets(
    document: TextDocument,
    position: Position,
    prefix: string,
    suffix: string,
    recentFiles: string[],
  ): Promise<SimilarSnippet[]> {
    console.log({
      slowRecentFiles: this._slowRecentFiles,
      currentRecentFiles: recentFiles,
    });
    if (this._slowRecentFiles.length !== 0) {
      if (
        !this._slowRecentFiles.some(
          (slowFile) => !recentFiles.includes(slowFile),
        )
      ) {
        timer.add('CompletionGenerate', 'GotSimilarSnippets');
        return [];
      }
      this._slowRecentFiles = [];
      console.info('PromptExtractor._getSimilarSnippets.enable');
    }

    const startTime = Date.now();
    const tabLines = (await getAllOtherTabContents(recentFiles)).map(
      (tabContent) => ({
        path: tabContent.path,
        lines: separateTextByLine(tabContent.content, true),
      }),
    );
    const contentsAroundContext = getContentsAroundContext(
      document,
      position,
      codeStripEnd(prefix),
      suffix,
    );

    tabLines.push(
      {
        path: document.fileName,
        lines: contentsAroundContext.before,
      },
      {
        path: document.fileName,
        lines: contentsAroundContext.after,
      },
    );

    const similarSnippets = Array<SimilarSnippet>();

    tabLines.forEach(({ path, lines }) => {
      const { score, startLine } = getMostSimilarSnippetStartLine(
        lines.map((line) =>
          tokenize(line, [
            IGNORE_RESERVED_KEYWORDS,
            IGNORE_COMMON_WORD,
            IGNORE_COMWARE_INTERNAL,
          ]),
        ),
        tokenize(prefix, [
          IGNORE_RESERVED_KEYWORDS,
          IGNORE_COMMON_WORD,
          IGNORE_COMWARE_INTERNAL,
        ]),
        separateTextByLine(prefix, true).length,
      );
      const currentMostSimilarSnippet: SimilarSnippet = {
        path,
        score: score,
        content: lines
          .slice(
            startLine,
            startLine + separateTextByLine(prefix, true).length + 10,
          )
          .join('\n'),
      };

      similarSnippets.push(currentMostSimilarSnippet);
    });

    const endTime = Date.now();
    if (endTime - startTime > 1000) {
      console.info(
        'PromptExtractor._getSimilarSnippets.disable',
        endTime - startTime,
      );
      this._slowRecentFiles = recentFiles;
    }

    timer.add('CompletionGenerate', 'GotSimilarSnippets');

    return similarSnippets
      .filter(
        (similarSnippet) =>
          similarSnippet.score > this._similarSnippetConfig.minScore,
      )
      .sort((first, second) => first.score - second.score)
      .reverse();
  }
}
