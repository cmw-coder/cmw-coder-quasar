import { basename } from 'path';
import {
  PromptElements,
  RawInputs,
  SimilarSnippetConfig,
} from 'main/components/PromptExtractor/types';
import {
  getFunctionPrefix,
  separateTextByLine,
  getFunctionSuffix,
} from 'main/components/PromptExtractor/utils';
import { container, getService } from 'main/services';
import { TextDocument } from 'main/types/TextDocument';
import { Position } from 'main/types/vscode/position';
import { SimilarSnippet } from 'shared/types/common';
import { ServiceType } from 'shared/types/service';
import { api_code_rag } from 'main/request/rag';
import { ConfigService } from 'main/services/ConfigService';
import { NetworkZone } from 'shared/config';
import { WindowService } from 'main/services/WindowService';
import { WindowType } from 'shared/types/WindowType';
import completionLog from '../Loggers/completionLog';

export class PromptExtractor {
  private _similarSnippetConfig: SimilarSnippetConfig = {
    minScore: 0.5,
  };
  private _slowRecentFiles?: string[];

  enableSimilarSnippet() {
    this._slowRecentFiles = undefined;
    completionLog.info('PromptExtractor.getSimilarSnippets.enable');
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
      this.getRagCode(functionPrefix, functionSuffix, document.fileName),
    ]);

    const similarSnippetsSliced = similarSnippets
      .filter(
        (similarSnippet) =>
          similarSnippet.score > this._similarSnippetConfig.minScore,
      )
      .slice(0, similarSnippetCount);
    completionLog.debug('PromptExtractor.getPromptComponents', {
      minScore: this._similarSnippetConfig.minScore,
      mostSimilarSnippets: similarSnippetsSliced,
    });
    completionLog.debug('PromptExtractor.getPromptComponents.ragCode', {
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
    const windowService = container.get<WindowService>(ServiceType.WINDOW);
    const completionsWindow = windowService.getWindow(WindowType.Completions);
    return completionsWindow.similarSnippetsSubprocess.proxyFn.getSimilarSnippets(
      {
        file: document.fileName,
        position,
        functionPrefix,
        functionSuffix,
        recentFiles,
      },
    );
  }

  async getRagCode(prefix: string, suffix: string, filePath: string) {
    const configService = container.get<ConfigService>(ServiceType.CONFIG);
    const networkZone = await configService.getConfig('networkZone');
    if (networkZone !== NetworkZone.Normal) {
      return '';
    }
    const inputLines: string[] = [];
    const prefixLines = separateTextByLine(prefix);
    // prefix 取后5行
    const prefixInputLines = prefixLines.slice(
      Math.max(prefixLines.length - 5, 0),
    );
    inputLines.push(...prefixInputLines);
    const suffixLines = separateTextByLine(suffix);
    // suffix 取前3行
    const suffixInputLines = suffixLines.slice(
      0,
      Math.min(suffixLines.length, 3),
    );
    inputLines.push(...suffixInputLines);
    const inputString = inputLines.join('\n').slice(0, 512);
    completionLog.debug(
      'PromptExtractor.getRagCode.api_code_rag.input',
      inputString,
    );
    const { output } = await api_code_rag(inputString);
    const filteredOutput = output.filter(
      (item) => basename(item.filePath) !== basename(filePath),
    );
    return filteredOutput
      .map((item) => {
        return `<file_sep>${item.filePath}\n${item.similarCode}`;
      })
      .join('\n');
  }
}
