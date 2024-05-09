import { readFile } from 'fs/promises';
import { decode } from 'iconv-lite';
import { basename, dirname } from 'path';

import { SymbolInfo } from 'main/types/SymbolInfo';
import { TextDocument } from 'main/types/TextDocument';
import { Position } from 'main/types/vscode/position';
import { timer } from 'main/utils/timer';
import { CompletionGenerateClientMessage } from 'shared/types/WsMessage';
import { container } from 'service/index';
import { ServiceType } from 'shared/services';
import type { DataStoreService } from 'service/entities/DataStoreService';

export class PromptElements {
  // NearCode
  prefix: string;
  // SuffixCode
  suffix: string;
  // Language
  language?: string;
  // FilePath
  file?: string;
  // RepoName
  folder?: string;
  // SimilarSnippet
  similarSnippet?: string;
  // RelativeDefinition
  symbols?: string;
  // ImportList
  importList?: string;
  // Comment
  comment?: string;

  constructor(prefix: string, suffix: string) {
    this.prefix = prefix.trimStart();
    this.suffix = suffix.trimEnd();
  }

  stringify() {
    const dataStoreService = container.get<DataStoreService>(
      ServiceType.DATA_STORE,
    );
    const { common } =
      dataStoreService.activeModelContent.prompt['c'].other.code;

    let question = common;

    question = question.replaceAll('%{NearCode}%', this.prefix);
    question = question.replaceAll('%{SuffixCode}%', this.suffix);
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

    return question;
  }
}

export interface SimilarSnippet {
  path: string;
  score: number;
  content: string;
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

    const relativePath = this.document.fileName.substring(this.project.length);
    this.elements.language = this.document.languageId;
    this.elements.file = basename(relativePath);
    this.elements.folder = dirname(relativePath);
  }

  get relativeDefinitions() {
    const result = Promise.all(
      this.symbols.map(async ({ path, startLine, endLine }) => ({
        path,
        content: decode(
          await readFile(path, {
            flag: 'r',
          }),
          'gb2312',
        )
          .split(/\r?\n/)
          .slice(startLine, endLine + 1)
          .join('\r\n'),
      })),
    );

    timer.add('CompletionGenerate', 'GotRelativeDefinitions');

    return result;
  }
}
