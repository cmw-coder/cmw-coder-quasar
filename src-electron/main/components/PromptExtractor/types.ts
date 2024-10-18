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
import { CompletionType, SymbolInfo } from 'shared/types/common';
import { CompletionGenerateClientMessage } from 'shared/types/WsMessage';
import { ServiceType } from 'shared/types/service';

export class PromptElements {
  // 全上文
  fullPrefix: string;
  slicedPrefix: string;
  // 全下文
  fullSuffix: string;
  slicedSuffix: string;
  // 函数内部时上文
  functionPrefix: string;
  // 函数内部时下文
  functionSuffix: string;
  language?: string;
  file?: string;
  folder?: string;
  frequentFunctions?: string;
  globals?: string;
  includes?: string;
  repo?: string;
  // SimilarSnippet
  similarSnippet?: string;
  // RelativeDefinition
  symbols?: string;
  // ImportList
  importList?: string;
  // Comment
  comment?: string;
  // NeighborSnippet
  neighborSnippet?: string;
  // CurrentFilePrefix
  currentFilePrefix: string;
  // RagCode
  ragCode?: string;
  // 是否在函数内部
  insideFunction: boolean;

  constructor(fullPrefix: string, fullSuffix: string) {
    this.fullPrefix = fullPrefix.trimStart();
    this.slicedPrefix = this.fullPrefix;
    this.fullSuffix = fullSuffix.trimEnd();
    this.slicedSuffix = this.fullSuffix;
    this.functionPrefix = getFunctionPrefix(this.fullPrefix) ?? this.fullPrefix;
    this.functionSuffix = getFunctionSuffix(this.fullSuffix) ?? this.fullSuffix;
    this.insideFunction = !!this.functionPrefix;

    this.currentFilePrefix = this.insideFunction
      ? this.functionPrefix
      : this.slicedPrefix;
  }

  async stringify(completionType: CompletionType) {
    const dataStoreService = getService(ServiceType.DATA_STORE);
    const { common, commonMulti } = (
      await dataStoreService.getActiveModelContent()
    ).prompt['c'].other.code;

    let question =
      completionType === CompletionType.Line ? common : commonMulti;
    question = question.replaceAll(
      '%{NeighborSnippet}%',
      this.neighborSnippet || '',
    );
    question = question.replaceAll(
      '%{CurrentFilePrefix}%',
      removeFunctionHeader(this.currentFilePrefix, completionType),
    );
    question = question.replaceAll(
      '%{NearCode}%',
      removeFunctionHeader(
        this.insideFunction ? this.functionPrefix : this.slicedPrefix,
        completionType,
      ),
    );
    question = question.replaceAll(
      '%{SuffixCode}%',
      completionType === CompletionType.Function
        ? ''
        : removeFunctionHeader(
            this.insideFunction ? this.functionSuffix : this.slicedSuffix,
            completionType,
          ),
    );
    question = question.replaceAll('%{Language}%', this.language || '');
    question = question.replaceAll('%{FilePath}%', this.file || '');
    question = question.replaceAll('%{RepoName}%', this.folder || '');
    question = question.replaceAll(
      '%{SimilarSnippet}%',
      this.similarSnippet || '',
    );
    question = question.replaceAll(
      '%{RelativeDefinition}%',
      this.symbols || '',
    );
    question = question.replaceAll('%{ImportList}%', this.importList || '');
    question = question.replaceAll('%{Comment}%', this.comment || '');
    question = question.replaceAll('%{RagCode}%', this.ragCode || '');
    completionLog.info('Template Length: ', {
      ragCode: this.ragCode?.length,
      symbols: this.symbols?.length,
      similarSnippet: this.similarSnippet?.length,
      slicedPrefix: this.slicedPrefix.length,
      slicedSuffix: this.slicedSuffix.length,
      currentFilePrefix: this.currentFilePrefix.length,
      neighborSnippet: this.neighborSnippet?.length,
      globals: this.globals?.length,
      includes: this.includes?.length,
      frequentFunctions: this.frequentFunctions?.length,
    });
    return question.trim();
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
    rawData: CompletionGenerateClientMessage['data'],
    project: string,
  ) {
    const { caret, path, prefix, recentFiles, suffix, symbols } = rawData;
    const decodedPrefix = decode(Buffer.from(prefix, 'base64'), 'utf-8');
    const decodedSuffix = decode(Buffer.from(suffix, 'base64'), 'utf-8');
    this.document = new TextDocument(path);
    this.elements = new PromptElements(decodedPrefix, decodedSuffix);
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
