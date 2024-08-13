import log from 'electron-log/main';
import { basename } from 'path';

import {
  IGNORE_COMMON_WORD,
  IGNORE_COMWARE_INTERNAL,
  IGNORE_RESERVED_KEYWORDS,
  MAX_RAG_CODE_QUERY_TIME,
} from 'main/components/PromptExtractor/constants';
import {
  PromptElements,
  RawInputs,
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
import { container, getService } from 'main/services';
import { TextDocument } from 'main/types/TextDocument';
import { Position } from 'main/types/vscode/position';
import { SimilarSnippet } from 'shared/types/common';
import { ServiceType } from 'shared/types/service';
import { api_code_rag, RagCode } from 'main/request/rag';
import { ConfigService } from 'main/services/ConfigService';
import { NetworkZone } from 'shared/config';

export class PromptExtractor {
  private _similarSnippetConfig: SimilarSnippetConfig = {
    minScore: 0.5,
  };
  private _slowRecentFiles?: string[];

  enableSimilarSnippet() {
    this._slowRecentFiles = undefined;
    log.info('PromptExtractor.getSimilarSnippets.enable');
  }

  async getPromptComponents(
    actionId: string,
    inputs: RawInputs,
    similarSnippetCount: number = 1,
  ): Promise<PromptElements> {
    const { elements, document, position, recentFiles } = inputs;
    const functionPrefix =
      getFunctionPrefix(elements.prefix) ?? elements.prefix;
    const functionSuffix =
      getFunctionSuffix(elements.suffix) ?? elements.suffix;

    const [similarSnippets, relativeDefinitions, ragCode] = await Promise.all([
      (async () => {
        const result = await this.getSimilarSnippets(
          document,
          position,
          functionPrefix,
          functionSuffix,
          recentFiles,
        );
        getService(ServiceType.STATISTICS).completionUpdateSimilarSnippetsTime(
          actionId,
        );
        return result;
      })(),
      (async () => {
        const relativeDefinitions = await inputs.getRelativeDefinitions();
        getService(
          ServiceType.STATISTICS,
        ).completionUpdateRelativeDefinitionsTime(actionId);
        return relativeDefinitions;
      })(),
      this.getRagCode(functionPrefix, functionSuffix),
    ]);

    const similarSnippetsSliced = similarSnippets
      .filter(
        (similarSnippet) =>
          similarSnippet.score > this._similarSnippetConfig.minScore,
      )
      .slice(0, similarSnippetCount);
    log.debug('PromptExtractor.getPromptComponents', {
      minScore: this._similarSnippetConfig.minScore,
      mostSimilarSnippets: similarSnippetsSliced,
    });
    log.debug('PromptExtractor.getPromptComponents.ragCode', {
      ragCode,
    });

    if (similarSnippetsSliced.length) {
      elements.similarSnippet = similarSnippetsSliced
        .map((similarSnippet) => similarSnippet.content)
        .join('\n');

      const selfFileSimilarSnippets = similarSnippetsSliced.filter(
        (item) =>
          item.path.toLocaleLowerCase() ===
          document.fileName.toLocaleLowerCase(),
      );
      const otherFileSimilarSnippets = similarSnippetsSliced.filter(
        (item) =>
          item.path.toLocaleLowerCase() !==
          document.fileName.toLocaleLowerCase(),
      );

      if (selfFileSimilarSnippets.length) {
        elements.currentFilePrefix =
          selfFileSimilarSnippets
            .map((similarSnippet) => similarSnippet.content)
            .join('\n') +
          '\n' +
          elements.currentFilePrefix;
      }
      if (otherFileSimilarSnippets.length) {
        elements.neighborSnippet = otherFileSimilarSnippets
          .map(
            (similarSnippet) =>
              `<file_sep>${basename(similarSnippet.path)}\n${similarSnippet.content}`,
          )
          .join('\n');
      }
    }

    if (relativeDefinitions.length) {
      elements.symbols = relativeDefinitions
        .map((relativeDefinition) => relativeDefinition.content)
        .join('\n');

      const selfFileRelativeDefinitions = relativeDefinitions.filter(
        (item) =>
          item.path.toLocaleLowerCase() ===
          document.fileName.toLocaleLowerCase(),
      );
      const otherFileRelativeDefinitions = relativeDefinitions.filter(
        (item) =>
          item.path.toLocaleLowerCase() !==
          document.fileName.toLocaleLowerCase(),
      );
      if (selfFileRelativeDefinitions.length) {
        elements.currentFilePrefix =
          selfFileRelativeDefinitions
            .map((relativeDefinition) => relativeDefinition.content)
            .join('\n') +
          '\n' +
          elements.currentFilePrefix;
      }
      if (otherFileRelativeDefinitions.length) {
        elements.neighborSnippet = otherFileRelativeDefinitions
          .map(
            (relativeDefinition) =>
              `<file_sep>${basename(relativeDefinition.path)}\n${relativeDefinition.content}`,
          )
          .join('\n');
      }
    }

    elements.ragCode = ragCode;

    return elements;
  }

  async getSimilarSnippets(
    document: TextDocument,
    position: Position,
    functionPrefix: string,
    functionSuffix: string,
    recentFiles: string[],
  ): Promise<SimilarSnippet[]> {
    log.debug({
      fileName: document.fileName,
      recentFiles,
    });
    if (this._slowRecentFiles) {
      if (
        !this._slowRecentFiles.some(
          (slowFile) => !recentFiles.includes(slowFile),
        )
      ) {
        return [];
      }
      this.enableSimilarSnippet();
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
    log.debug('PromptExtractor.getSimilarSnippets', {
      referenceSnippetLines,
    });

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
        'PromptExtractor.getSimilarSnippets.disable',
        endTime - startTime,
      );
      this._slowRecentFiles = recentFiles;
    }

    return similarSnippets
      .filter((mostSimilarSnippet) => mostSimilarSnippet.score > 0)
      .sort((first, second) => first.score - second.score)
      .reverse();
  }

  async getRagCode(prefix: string, suffix: string) {
    const configService = container.get<ConfigService>(ServiceType.CONFIG);
    const networkZone = await configService.getConfig('networkZone');
    if (networkZone !== NetworkZone.Normal) {
      return '';
    }
    const inputLines: string[] = [];
    const prefixLines = separateTextByLine(prefix, true);
    // prefix 取后5行
    const prefixInputLines = prefixLines.slice(
      Math.max(prefixLines.length - 5, 0),
    );
    inputLines.push(...prefixInputLines);
    const suffixLines = separateTextByLine(suffix, true);
    // suffix 取前3行
    const suffixInputLines = suffixLines.slice(
      0,
      Math.min(suffixLines.length, 3),
    );
    inputLines.push(...suffixInputLines);
    const inputString = inputLines.join('\n').slice(0, 512);
    const { output } = await Promise.race([
      api_code_rag(inputString),
      new Promise<{
        output: RagCode[];
      }>((resolve) => {
        setTimeout(() => {
          resolve({
            output: [],
          });
        }, MAX_RAG_CODE_QUERY_TIME);
      }),
    ]);
    return output
      .map((item) => {
        return `<file_sep>${item.filePath}\n${item.similarCode}`;
      })
      .join('\n');
  }
}
