import { basename, extname } from 'path';
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
import { asyncMemoizeWithLimit } from 'shared/utils';

export class PromptExtractor {
  private _globals: string = '';
  private _includes: string = '';
  private _lastCaretPosition: Position = new Position(-1, -1);
  private _frequentFunctions: string = '';
  private _ragCode: string = '';
  private _relativeDefinitions: { path: string; content: string }[] = [];
  private _similarSnippets: SimilarSnippet[] = [];
  private _similarSnippetConfig: SimilarSnippetConfig = {
    minScore: 0.5,
  };
  private _memoizedApiRagCode = asyncMemoizeWithLimit(apiRagCode, 50);

  async getPromptComponents(
    actionId: string,
    inputs: RawInputs,
    similarSnippetCount: number = 1,
  ): Promise<PromptElements> {
    const { elements, document, position, recentFiles } = inputs;
    const queryPrefix = elements.functionPrefix ?? elements.slicedPrefix;
    const querySuffix = elements.functionSuffix ?? elements.slicedSuffix;

    if (position.line != this._lastCaretPosition.line) {
      this._getFrequentFunctions(inputs).then((frequentFunctions) => {
        if (frequentFunctions !== undefined) {
          this._frequentFunctions = frequentFunctions;
        }
      });
      this._getGlobals(inputs.document.fileName).then((globals) => {
        if (globals !== undefined) {
          this._globals = globals;
        }
      });

      this._getIncludes(inputs.document.fileName).then((includes) => {
        if (includes !== undefined) {
          this._includes = includes;
        }
      });

      const [ragCode, relativeDefinitions, similarSnippets] = await Promise.all(
        [
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
            const relativeDefinitions =
              await this._getRelativeDefinitions(inputs);
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
            getService(
              ServiceType.STATISTICS,
            ).completionUpdateSimilarSnippetsTime(actionId);
            return result;
          })(),
        ],
      );
      this._ragCode = ragCode;
      if (relativeDefinitions !== undefined) {
        this._relativeDefinitions = relativeDefinitions;
      }
      this._similarSnippets = similarSnippets;
      this._lastCaretPosition = position;
    }

    if (extname(elements.file ?? '') !== '.h') {
      elements.frequentFunctions = this._frequentFunctions;
      elements.globals = this._globals.length > 512 ? '' : this._globals;
      elements.includes = this._includes;
    }
    elements.ragCode = this._ragCode;

    console.log('PromptExtractor.getPromptComponents', {
      frequentFunctions: elements.frequentFunctions,
      globals: elements.globals,
      includes: elements.includes,
      ragCode: this._ragCode,
    });

    const similarSnippetsSliced = this._similarSnippets
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

    if (this._relativeDefinitions.length) {
      elements.symbols = this._relativeDefinitions
        .map((relativeDefinition) => relativeDefinition.content)
        .join('\n');

      // const selfFileRelativeDefinitions = this._relativeDefinitions.filter(
      //   (item) =>
      //     item.path.toLocaleLowerCase() ===
      //     document.fileName.toLocaleLowerCase(),
      // );
      // const otherFileRelativeDefinitions = this._relativeDefinitions.filter(
      //   (item) =>
      //     item.path.toLocaleLowerCase() !==
      //     document.fileName.toLocaleLowerCase(),
      // );
      elements.currentFilePrefix =
        this._relativeDefinitions
          .map((relativeDefinition) => relativeDefinition.content)
          .join('\n') +
        '\n' +
        elements.currentFilePrefix;

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

  private async _getGlobals(filePath: string) {
    const windowService = container.get<WindowService>(ServiceType.WINDOW);
    const fileStructureAnalysisProcessSubprocess = windowService.getWindow(
      WindowType.Completions,
    ).fileStructureAnalysisProcessSubprocess;
    return fileStructureAnalysisProcessSubprocess.proxyFn.getGlobals(filePath);
  }

  private async _getIncludes(filePath: string) {
    const windowService = container.get<WindowService>(ServiceType.WINDOW);
    const fileStructureAnalysisProcessSubprocess = windowService.getWindow(
      WindowType.Completions,
    ).fileStructureAnalysisProcessSubprocess;
    return fileStructureAnalysisProcessSubprocess.proxyFn.getIncludes(
      filePath,
      1024,
    );
  }

  private async _getFrequentFunctions(
    inputs: RawInputs,
  ): Promise<string | undefined> {
    const windowService = container.get<WindowService>(ServiceType.WINDOW);
    const fileStructureAnalysisProcessSubprocess = windowService.getWindow(
      WindowType.Completions,
    ).fileStructureAnalysisProcessSubprocess;
    const calledFunctionIdentifiers =
      await fileStructureAnalysisProcessSubprocess.proxyFn.getCalledFunctionIdentifiers(
        inputs.document.fileName,
      );
    if (calledFunctionIdentifiers === undefined) {
      return undefined;
    }
    const frequencyMap = new Map<string, number>();
    for (const identifier of calledFunctionIdentifiers) {
      const count = frequencyMap.get(identifier) ?? 0;
      frequencyMap.set(identifier, count + 1);
    }
    const calledFunctionIdentifiersSorted = Array.from(frequencyMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map((item) => item[0]);
    return (
      await this._getRagFunctionDeclaration(
        calledFunctionIdentifiersSorted.slice(
          0,
          Math.min(Math.ceil(calledFunctionIdentifiersSorted.length * 0.3), 15),
        ),
        inputs.document.fileName.substring(
          inputs.document.fileName.indexOf(inputs.elements.repo ?? ''),
        ),
      )
    ).join('\n');
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
    const { output } = await this._memoizedApiRagCode(inputString);
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
    const sliceIndex = identifiers.findIndex(
      (_, i) => identifiers.slice(0, i).join('\n').trim().length >= 512,
    );
    const trimmedIdentifiers = identifiers.slice(
      0,
      sliceIndex === -1 ? identifiers.length : sliceIndex,
    );
    const functionDeclarations =
      await apiRagFunctionDeclaration(trimmedIdentifiers);
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

  private async _getRelativeDefinitions(inputs: RawInputs) {
    const windowService = container.get<WindowService>(ServiceType.WINDOW);
    const fileStructureAnalysisProcessSubprocess = windowService.getWindow(
      WindowType.Completions,
    ).fileStructureAnalysisProcessSubprocess;
    return fileStructureAnalysisProcessSubprocess.proxyFn.getRelativeDefinitions(
      inputs.symbols,
    );
  }
}
