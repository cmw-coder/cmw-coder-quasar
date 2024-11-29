import { decode } from 'iconv-lite';
import { basename, dirname } from 'path';

import completionLog from 'main/components/Loggers/completionLog';
import { MODULE_PATH } from 'main/components/PromptExtractor/constants';
import {
  getFunctionPrefix,
  getFunctionSuffix,
  removeFunctionHeader,
} from 'main/components/PromptExtractor/utils';
import { getService } from 'main/services';
import { TextDocument } from 'main/types/TextDocument';
import { Position } from 'main/types/vscode/position';
import { CaretPosition, CompletionType, SymbolInfo } from 'shared/types/common';
import { ServiceType } from 'shared/types/service';

export class PromptElements {
  private readonly _isInsideFunction: boolean;

  functionPrefix: string;
  functionSuffix: string;
  fullPrefix: string;
  fullSuffix: string;
  slicedPrefix: string;
  slicedSuffix: string;
  // Optionals
  comment?: string;
  currentFilePrefix: string;
  file?: string;
  folder?: string;
  frequentFunctions?: string;
  globals?: string;
  importList?: string;
  includes?: string;
  language?: string;
  neighborSnippet?: string;
  pasteContent?: string;
  ragCode?: string;
  relativeDefinition?: string;
  repo?: string;
  similarSnippet?: string;

  constructor(fullPrefix: string, fullSuffix: string) {
    this.fullPrefix = fullPrefix.trimStart();
    this.slicedPrefix = this.fullPrefix;
    this.fullSuffix = fullSuffix.trimEnd();
    this.slicedSuffix = this.fullSuffix;
    this.functionPrefix =
      getFunctionPrefix(this.fullPrefix) ?? this.slicedPrefix;
    this.functionSuffix =
      getFunctionSuffix(this.fullSuffix) ?? this.slicedSuffix;
    this._isInsideFunction = !!this.functionPrefix;

    this.currentFilePrefix = this._isInsideFunction
      ? this.functionPrefix
      : this.slicedPrefix;
  }

  async stringify(completionType: CompletionType) {
    const dataStoreService = getService(ServiceType.DATA_STORE);
    let promptString: string;
    if (this.pasteContent?.length) {
      promptString = (await dataStoreService.getActiveModelContent()).template[
        'PasteFix'
      ];
    } else {
      const { common, commonMulti } = (
        await dataStoreService.getActiveModelContent()
      ).prompt['c'].other.code;
      promptString =
        completionType === CompletionType.Line ? common : commonMulti;
    }

    completionLog.info('Template Length: ', {
      ragCode: this.ragCode?.length,
      symbols: this.relativeDefinition?.length,
      similarSnippet: this.similarSnippet?.length,
      slicedPrefix: this.slicedPrefix.length,
      slicedSuffix: this.slicedSuffix.length,
      currentFilePrefix: this.currentFilePrefix.length,
      neighborSnippet: this.neighborSnippet?.length,
      globals: this.globals?.length,
      includes: this.includes?.length,
      frequentFunctions: this.frequentFunctions?.length,
    });
    return promptString
      .replaceAll('%{Comment}%', this.comment ?? '')
      .replaceAll(
        '%{CurrentFilePrefix}%',
        removeFunctionHeader(this.currentFilePrefix, completionType),
      )
      .replaceAll('%{FilePath}%', this.file ?? '')
      .replaceAll('%{ImportList}%', this.importList ?? '')
      .replaceAll('%{Language}%', this.language ?? '')
      .replaceAll(
        '%{NearCode}%',
        removeFunctionHeader(
          this._isInsideFunction ? this.functionPrefix : this.slicedPrefix,
          completionType,
        ),
      )
      .replaceAll('%{NeighborSnippet}%', this.neighborSnippet ?? '')
      .replaceAll('%{PasteContent}%', this.pasteContent ?? '')
      .replaceAll('%{RagCode}%', this.ragCode ?? '')
      .replaceAll('%{RelativeDefinition}%', this.relativeDefinition ?? '')
      .replaceAll('%{RepoName}%', this.folder ?? '')
      .replaceAll('%{SimilarSnippet}%', this.similarSnippet ?? '')
      .replaceAll(
        '%{SuffixCode}%',
        completionType === CompletionType.Function
          ? ''
          : removeFunctionHeader(
              this._isInsideFunction ? this.functionSuffix : this.slicedSuffix,
              completionType,
            ),
      )
      .trim();
  }
}

export interface SimilarSnippetConfig {
  minScore: number;
}

export class RawInputs {
  document: TextDocument;
  elements: PromptElements;
  position: Position;
  project: string;
  recentFiles: string[];
  symbols: SymbolInfo[];

  constructor(
    rawData: {
      caret: CaretPosition;
      content?: string;
      path: string;
      prefix: string;
      recentFiles: string[];
      suffix: string;
      symbols: SymbolInfo[];
    },
    project: string,
  ) {
    const { content, caret, path, prefix, recentFiles, suffix, symbols } = rawData;
    const decodedPrefix = decode(Buffer.from(prefix, 'base64'), 'utf-8');
    const decodedSuffix = decode(Buffer.from(suffix, 'base64'), 'utf-8');
    this.document = new TextDocument(path);
    this.elements = new PromptElements(decodedPrefix, decodedSuffix);
    if (content?.length) {
      this.elements.pasteContent = content;
    }
    this.position = new Position(caret.line, caret.character);
    this.project = project;
    this.recentFiles = recentFiles.filter(
      (fileName) => fileName !== this.document.fileName,
    );
    this.symbols = symbols;

    this.elements.language = this.document.languageId;
    this.elements.file = basename(this.document.fileName);
    this.elements.folder = dirname(this.document.fileName);
    for (const [key, value] of Object.entries(MODULE_PATH)) {
      if (this.document.fileName.includes(value)) {
        this.elements.repo = key;
        break;
      }
    }
  }
}
