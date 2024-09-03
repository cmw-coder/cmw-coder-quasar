import { readFile } from 'fs/promises';
import { decode } from 'iconv-lite';
import { basename, dirname } from 'path';

import { MODULE_PATH } from 'main/components/PromptExtractor/constants';
import {
  getBoundingPrefix,
  getBoundingSuffix,
  removeFunctionHeader,
} from 'main/components/PromptExtractor/utils';
import { getService } from 'main/services';
import { TextDocument } from 'main/types/TextDocument';
import { Position } from 'main/types/vscode/position';
import { NEW_LINE_REGEX } from 'shared/constants/common';
import { CompletionType, SymbolInfo } from 'shared/types/common';
import { CompletionGenerateClientMessage } from 'shared/types/WsMessage';
import { ServiceType } from 'shared/types/service';
import completionLog from '../Loggers/completionLog';

export class PromptElements {
  // NearCode
  prefix: string;
  // SuffixCode
  suffix: string;
  // Language
  language?: string;
  file?: string;
  folder?: string;
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

  constructor(prefix: string, suffix: string) {
    this.prefix = prefix.trimStart();
    this.suffix = suffix.trimEnd();
    this.currentFilePrefix = getBoundingPrefix(this.prefix) ?? this.prefix;
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
        getBoundingPrefix(this.prefix) ?? this.prefix,
        completionType,
      ),
    );
    question = question.replaceAll(
      '%{SuffixCode}%',
      removeFunctionHeader(
        getBoundingSuffix(this.suffix) ?? this.suffix,
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
      prefix: this.prefix.length,
      suffix: this.suffix.length,
      currentFilePrefix: this.currentFilePrefix.length,
      neighborSnippet: this.neighborSnippet?.length,
    });
    return question;
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
    this.document = new TextDocument(path);
    this.elements = new PromptElements(prefix, suffix);
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

  async getRelativeDefinitions() {
    const result = await Promise.all(
      this.symbols.map(async ({ path, startLine, endLine }) => {
        try {
          return {
            path,
            content: decode(
              await readFile(path, {
                flag: 'r',
              }),
              'gb2312',
            )
              .split(NEW_LINE_REGEX)
              .slice(startLine, endLine + 1)
              .join('\n'),
          };
        } catch (e) {
          completionLog.error('getRelativeDefinitions', e);
          return {
            path,
            content: '',
          };
        }
      }),
    );

    return result.filter(({ content }) => content.split('\n').length <= 100);
  }
}
