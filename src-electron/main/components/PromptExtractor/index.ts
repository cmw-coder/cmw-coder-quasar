import log from 'electron-log/main';
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
  getFunctionPrefix,
  getAllOtherTabContents,
  getRemainedCodeContents,
  getMostSimilarSnippetStartLine,
  separateTextByLine,
  tokenize,
  getFunctionSuffix,
} from 'main/components/PromptExtractor/utils';
import { TextDocument } from 'main/types/TextDocument';
import { Position } from 'main/types/vscode/position';
import { timer } from 'main/utils/timer';

export class PromptExtractor {
  private _similarSnippetConfig: SimilarSnippetConfig = {
    minScore: 0.5,
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
        getFunctionPrefix(elements.prefix) ?? elements.prefix,
        getFunctionSuffix(elements.suffix) ?? elements.suffix,
        recentFiles,
      ),
      inputs.relativeDefinitions,
    ]);

    const similarSnippetsSliced = similarSnippets.slice(0, similarSnippetCount);
    log.debug('PromptExtractor.getPromptComponents', {
      minScore: this._similarSnippetConfig.minScore,
      mostSimilarSnippets: similarSnippetsSliced,
    });

    if (similarSnippetsSliced.length) {
      elements.similarSnippet = similarSnippetsSliced
        .map((similarSnippet) => similarSnippet.content)
        .join('\n');
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
        .join('\n');
    }

    return elements;
  }

  private async _getSimilarSnippets(
    document: TextDocument,
    position: Position,
    functionPrefix: string,
    functionSuffix: string,
    recentFiles: string[],
  ): Promise<SimilarSnippet[]> {
    log.debug({
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
      log.info('PromptExtractor._getSimilarSnippets.enable');
    }

    const startTime = Date.now();
    const tabContentsWithoutComments = (
      await getAllOtherTabContents(recentFiles)
    ).map((tabContent) => ({
      path: tabContent.path,
      lines: separateTextByLine(tabContent.content, true),
    }));

    const remainedCodeContents = getRemainedCodeContents(
      document,
      position,
      functionPrefix,
      functionSuffix,
    );
    tabContentsWithoutComments.push(
      {
        path: document.fileName,
        lines: remainedCodeContents.before,
      },
      {
        path: document.fileName,
        lines: remainedCodeContents.after,
      },
    );

    const similarSnippets = Array<SimilarSnippet>();
    const referenceSnippetLines = separateTextByLine(
      functionPrefix + functionSuffix,
    );

    tabContentsWithoutComments.forEach(({ path, lines }) => {
      const { score, startLine } = getMostSimilarSnippetStartLine(
        lines.map((line) =>
          tokenize(line, [
            IGNORE_RESERVED_KEYWORDS,
            IGNORE_COMMON_WORD,
            IGNORE_COMWARE_INTERNAL,
          ]),
        ),
        tokenize(referenceSnippetLines.join('\n'), [
          IGNORE_RESERVED_KEYWORDS,
          IGNORE_COMMON_WORD,
          IGNORE_COMWARE_INTERNAL,
        ]),
        referenceSnippetLines.length,
      );
      const currentMostSimilarSnippet: SimilarSnippet = {
        path,
        score: score,
        content: lines
          .slice(startLine, startLine + referenceSnippetLines.length + 10)
          .join('\n'),
      };

      similarSnippets.push(currentMostSimilarSnippet);
    });

    const endTime = Date.now();
    if (endTime - startTime > 1000) {
      log.info(
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
