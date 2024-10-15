import { basename } from 'path';
import {
  PromptElements,
  RawInputs,
  SimilarSnippetConfig,
} from 'main/components/PromptExtractor/types';
import { separateTextByLine } from 'main/components/PromptExtractor/utils';
import { container, getService } from 'main/services';
import { TextDocument } from 'main/types/TextDocument';
import { Position } from 'main/types/vscode/position';
import { SimilarSnippet } from 'shared/types/common';
import { ServiceType } from 'shared/types/service';
import { apiRagCode, apiRagFunctionDeclaration } from 'main/request/rag';
import { ConfigService } from 'main/services/ConfigService';
import { NetworkZone } from 'shared/config';
import { WindowService } from 'main/services/WindowService';
import { WindowType } from 'shared/types/WindowType';
import completionLog from 'main/components/Loggers/completionLog';

export class PromptExtractor {
  private _globals: string = '';
  private _includes: string = '';
  private _frequentFunctions: string = '';
  private _similarSnippetConfig: SimilarSnippetConfig = {
    minScore: 0.5,
  };

  async getPromptComponents(
    actionId: string,
    inputs: RawInputs,
    similarSnippetCount: number = 1,
  ): Promise<PromptElements> {
    const { elements, document, position, recentFiles } = inputs;
    const queryPrefix = elements.functionPrefix ?? elements.slicedPrefix;
    const querySuffix = elements.functionSuffix ?? elements.slicedSuffix;

    this._getFrequentFunctions(actionId, inputs).then((frequentFunctions) => {
      this._frequentFunctions = frequentFunctions;
    });
    this._getGlobals(actionId, inputs).then((globals) => {
      this._globals = globals;
    });
    this._getIncludes(actionId, inputs).then((includes) => {
      this._includes = includes;
    });

    const [ragCode, relativeDefinitions, similarSnippets] = await Promise.all([
      (async () => {
        const ragCode = await this._getRagCode(
          queryPrefix,
          querySuffix,
          document.fileName,
        );
        getService(ServiceType.STATISTICS).completionUpdateRagCodeTime(
          actionId,
        );
        return ragCode;
      })(),
      (async () => {
        const relativeDefinitions = await inputs.getRelativeDefinitions();
        getService(
          ServiceType.STATISTICS,
        ).completionUpdateRelativeDefinitionsTime(actionId);
        return relativeDefinitions;
      })(),
      (async () => {
        const result = await this.getSimilarSnippets(
          document,
          position,
          queryPrefix,
          querySuffix,
          recentFiles,
        );
        getService(ServiceType.STATISTICS).completionUpdateSimilarSnippetsTime(
          actionId,
        );
        return result;
      })(),
    ]);

    elements.frequentFunctions = this._frequentFunctions;
    elements.globals = this._globals;
    elements.includes = this._includes;
    elements.ragCode = ragCode;

    console.log('PromptExtractor.getPromptComponents', {
      frequentFunctions: elements.frequentFunctions,
      globals: elements.globals,
      includes: elements.includes,
      ragCode,
    });

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

    // 拼接 neighborSnippet currentFilePrefix
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
      // 本文件全局变量
      if (elements.globals) {
        elements.currentFilePrefix =
          elements.globals + '\n' + elements.currentFilePrefix;
      }
      // 本文件高频接口的函数声明
      if (elements.frequentFunctions) {
        elements.currentFilePrefix =
          elements.frequentFunctions + '\n' + elements.currentFilePrefix;
      }
      // 本文件 include 块
      if (elements.includes) {
        elements.currentFilePrefix =
          elements.includes + '\n' + elements.currentFilePrefix;
      }
    }

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

  private async _getFrequentFunctions(
    actionId: string,
    inputs: RawInputs,
  ): Promise<string> {
    const calledFunctionIdentifiers =
      await inputs.getCalledFunctionIdentifiers();
    const frequencyMap = new Map<string, number>();
    for (const identifier of calledFunctionIdentifiers) {
      const count = frequencyMap.get(identifier) ?? 0;
      frequencyMap.set(identifier, count + 1);
    }
    const calledFunctionIdentifiersSorted = Array.from(frequencyMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map((item) => item[0]);
    const frequentFunctions = (
      await this._getRagFunctionDeclaration(
        calledFunctionIdentifiersSorted.slice(
          0,
          Math.ceil(calledFunctionIdentifiersSorted.length * 0.3),
        ),
        inputs.document.fileName.substring(
          inputs.document.fileName.indexOf(inputs.elements.repo ?? ''),
        ),
      )
    ).join('\n');
    getService(ServiceType.STATISTICS).completionUpdateFrequentFunctionsTime(
      actionId,
    );
    return frequentFunctions;
  }

  private async _getGlobals(actionId: string, inputs: RawInputs) {
    const globals = await inputs.getGlobals();
    getService(ServiceType.STATISTICS).completionUpdateGlobalsTime(actionId);
    return globals;
  }

  private async _getIncludes(actionId: string, inputs: RawInputs) {
    const includes = await inputs.getIncludes();
    getService(ServiceType.STATISTICS).completionUpdateIncludesTime(actionId);
    return includes;
  }

  private async _getRagCode(prefix: string, suffix: string, filePath: string) {
    const configService = container.get<ConfigService>(ServiceType.CONFIG);
    const networkZone = await configService.getConfig('networkZone');
    if (networkZone !== NetworkZone.Normal) {
      return '';
    }
    const inputLines: string[] = [];
    const prefixLines = separateTextByLine(prefix.trim());
    // prefix 取后5行
    const prefixInputLines = prefixLines.slice(
      Math.max(prefixLines.length - 5, 0),
    );
    inputLines.push(...prefixInputLines);
    const suffixLines = separateTextByLine(suffix.trim());
    // suffix 取前3行
    const suffixInputLines = suffixLines.slice(
      0,
      Math.min(suffixLines.length, 3),
    );
    inputLines.push(...suffixInputLines);
    const inputString = inputLines.join('\n').slice(0, 512).trim();
    const { output } = await apiRagCode(inputString);
    const filteredOutput = output.filter(
      (item) => basename(item.filePath) !== basename(filePath),
    );
    return filteredOutput
      .map((item) => {
        return `<file_sep>${item.filePath}\n${item.similarCode}`;
      })
      .join('\n');
  }

  private async _getRagFunctionDeclaration(
    identifiers: string[],
    currentRepoPath: string,
  ) {
    const configService = container.get<ConfigService>(ServiceType.CONFIG);
    const networkZone = await configService.getConfig('networkZone');
    if (networkZone !== NetworkZone.Normal) {
      return [];
    }
    const inputString = identifiers
      .slice(
        0,
        identifiers.findIndex(
          (_, i) => identifiers.slice(0, i).join('\n').trim().length >= 512,
        ),
      )
      .join('\n')
      .trim();
    const functionDeclarations = await apiRagFunctionDeclaration(inputString);
    completionLog.debug('getRagFunctionDeclaration', {
      functionDeclarations,
    });
    return functionDeclarations.map(({ functionDeclarations }) => {
      let longestPathPrefixContent = '';
      let longestPathPrefixCount = -2;

      functionDeclarations.forEach(({ content, path }) => {
        const mismatchIndex = path
          .split('')
          .findIndex((char, index) => char !== currentRepoPath[index]);
        if (mismatchIndex > longestPathPrefixCount) {
          longestPathPrefixCount = mismatchIndex;
          longestPathPrefixContent = content;
        }
      });

      return longestPathPrefixContent;
    });
  }
}
