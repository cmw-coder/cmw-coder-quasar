import { decode } from 'iconv-lite';
import { basename, dirname } from 'path';

import completionLog from 'main/components/Loggers/completionLog';
import { MODULE_PATH } from 'main/components/PromptExtractor/constants';
import {
  calculateFunctionPrefix,
  calculateFunctionSuffix,
  removeFunctionHeader,
} from 'main/components/PromptExtractor/utils';
import { getService } from 'main/services';
import { TextDocument } from 'main/types/TextDocument';
import {
  CaretPosition,
  CompletionType,
  GenerateType,
  Selection,
  SymbolInfo,
} from 'shared/types/common';
import { ServiceType } from 'shared/types/service';
import { CompletionGenerateClientMessage } from 'shared/types/WsMessage';
import { TemplateType } from 'shared/types/service/DataServiceTrait/types';

export class PromptElements {
  private readonly _isInsideFunction: boolean;

  functionPrefix: string;
  functionSuffix: string;
  fullInfix: string;
  fullPrefix: string;
  fullSuffix: string;
  generateType: GenerateType;
  // Optionals
  comment?: string;
  file?: string;
  folder?: string;
  frequentFunctions?: string;
  globals?: string;
  importList?: string;
  includes?: string;
  language?: string;
  ragCode?: string;
  relativeDefinition?: string;
  repo?: string;
  similarSnippetNeighbor?: string;
  similarSnippetSelf?: string;

  constructor(
    generateType: GenerateType,
    context: CompletionGenerateClientMessage['data']['context'],
  ) {
    this.generateType = generateType;
    this.fullInfix = context.infix;
    this.fullPrefix = context.prefix.trimStart();
    this.fullSuffix = context.suffix.trimEnd();
    this.functionPrefix = calculateFunctionPrefix(this.fullPrefix);
    this.functionSuffix = calculateFunctionSuffix(this.fullSuffix);
    this._isInsideFunction = !!this.functionPrefix;
  }

  async stringify(completionType: CompletionType) {
    const activeModelContent = await getService(
      ServiceType.DATA,
    ).getActiveModelContent();
    let promptString: string;
    switch (this.generateType) {
      case GenerateType.Common: {
        promptString = activeModelContent.prompt['c'].other.code.commonMulti;
        break;
      }
      case GenerateType.PasteReplace: {
        promptString = activeModelContent.template[
          TemplateType.PasteFix
        ].replaceAll('%{PasteContent}%', this.fullInfix ?? '');
        break;
      }
      default: {
        throw new Error('Invalid generate type');
      }
    }

    const currentFilePrefix = removeFunctionHeader(
      this._calculateCurrentFilePrefix(),
      completionType,
    );
    const nearCode = removeFunctionHeader(
      this._isInsideFunction ? this.functionPrefix : this.fullPrefix,
      completionType,
    );
    const suffixCode =
      completionType === CompletionType.Function
        ? ''
        : removeFunctionHeader(
            this._isInsideFunction ? this.functionSuffix : this.fullSuffix,
            completionType,
          );

    completionLog.info('Template elements length: ', {
      Comment: this.comment?.length,
      CurrentFilePrefix: currentFilePrefix.length,
      FilePath: this.file?.length,
      ImportList: this.importList?.length,
      Language: this.language?.length,
      NearCode: nearCode.length,
      NeighborSnippet: this.similarSnippetNeighbor?.length,
      RagCode: this.ragCode?.length,
      RelativeDefinition: this.relativeDefinition?.length,
      RepoName: this.repo?.length,
      SimilarSnippet: this.similarSnippetSelf?.length,
      SuffixCode: suffixCode.length,
    });

    return promptString
      .replaceAll('%{Comment}%', this.comment ?? '')
      .replaceAll('%{CurrentFilePrefix}%', currentFilePrefix)
      .replaceAll('%{FilePath}%', this.file ?? '')
      .replaceAll('%{ImportList}%', this.importList ?? '')
      .replaceAll('%{Language}%', this.language ?? '')
      .replaceAll('%{NearCode}%', nearCode)
      .replaceAll('%{NeighborSnippet}%', this.similarSnippetNeighbor ?? '')
      .replaceAll('%{RagCode}%', this.ragCode ?? '')
      .replaceAll('%{RelativeDefinition}%', this.relativeDefinition ?? '')
      .replaceAll('%{RepoName}%', this.repo ?? '')
      .replaceAll('%{SimilarSnippet}%', this.similarSnippetSelf ?? '')
      .replaceAll('%{SuffixCode}%', suffixCode)
      .trim();
  }

  private _calculateCurrentFilePrefix() {
    const currentFilePrefixList: string[] = [];
    const prefix = this._isInsideFunction
      ? this.functionPrefix
      : this.fullPrefix;

    completionLog.debug('CurrentFilePrefix elements length: ', {
      includes: this.includes?.length,
      frequentFunctions: this.frequentFunctions?.length,
      globals: this.globals?.length,
      relativeDefinition: this.relativeDefinition?.length,
      selfSimilarSnippet: this.similarSnippetSelf?.length,
      prefix,
    });

    if (this.includes?.length) {
      currentFilePrefixList.push(this.includes);
    }
    if (this.frequentFunctions?.length) {
      currentFilePrefixList.push(this.frequentFunctions);
    }
    if (this.globals?.length) {
      currentFilePrefixList.push(this.globals);
    }
    if (this.relativeDefinition?.length) {
      currentFilePrefixList.push(this.relativeDefinition);
    }
    if (this.similarSnippetSelf?.length) {
      currentFilePrefixList.push(this.similarSnippetSelf);
    }
    currentFilePrefixList.push(prefix);
    return currentFilePrefixList.join('\n');
  }
}

export interface SimilarSnippetConfig {
  minScore: number;
}

export class RawInputs {
  document: TextDocument;
  elements: PromptElements;
  selection: Selection;
  project: string;
  recentFiles: string[];
  symbols: SymbolInfo[];

  constructor(
    rawData: CompletionGenerateClientMessage['data'],
    project: string,
  ) {
    const { type, caret, path, context, recentFiles, symbols } = rawData;
    this.document = new TextDocument(path);
    this.elements = new PromptElements(type, {
      infix: decode(Buffer.from(context.infix, 'base64'), 'utf-8'),
      prefix: decode(Buffer.from(context.prefix, 'base64'), 'utf-8'),
      suffix: decode(Buffer.from(context.suffix, 'base64'), 'utf-8'),
    });

    switch (type) {
      case GenerateType.Common: {
        this.selection = new Selection(
          new CaretPosition(caret.line, caret.character),
          new CaretPosition(caret.line, caret.character),
        );
        break;
      }
      case GenerateType.PasteReplace: {
        const infixLines = this.elements.fullInfix.split('\n');
        this.selection = new Selection(
          new CaretPosition(caret.line, caret.character),
          new CaretPosition(
            caret.line + infixLines.length - 1,
            infixLines[infixLines.length - 1].length,
          ),
        );
        break;
      }
      default: {
        throw new Error('Invalid generate type');
      }
    }

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
