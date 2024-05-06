import { readFile } from 'fs/promises';
import { basename, dirname } from 'path';

import { SeparateTokens } from 'main/stores/config/types';
import { SymbolInfo } from 'main/types/SymbolInfo';
import { TextDocument } from 'main/types/TextDocument';
import { Position } from 'main/types/vscode/position';
import { timer } from 'main/utils/timer';
import { CompletionGenerateClientMessage } from 'shared/types/WsMessage';
import { container } from 'service/index';
import { ServiceType } from 'shared/services';
import type { DataStoreService } from 'service/entities/DataStoreService';

export class PromptElements {
  file?: string;
  folder?: string;
  language?: string;
  prefix: string;
  similarSnippet?: string;
  suffix: string;
  symbols?: string;

  constructor(prefix: string, suffix: string) {
    this.prefix = prefix.trimStart();
    this.suffix = suffix.trimEnd();
  }

  stringify(separateTokens: SeparateTokens) {
    const dataStoreService = container.get<DataStoreService>(
      ServiceType.DATA_STORE,
    );
    const { start, end, middle } = separateTokens;
    const result = Array<string>();
    if (this.folder) {
      result.push(`<REPO>${this.folder}`);
    }
    if (this.file) {
      result.push(`<FILENAME>${this.file}`);
    }
    if (this.language) {
      result.push(`<LANGUAGE>${this.language}`);
    }
    result.push(start);
    if (this.similarSnippet) {
      result.push(`${this.similarSnippet}\r\n`);
    }
    if (this.symbols) {
      result.push(`${this.symbols}\r\n`);
    }
    result.push(this.prefix);
    result.push(end);
    result.push(this.suffix);
    result.push(middle);
    return result.join('');
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
        content: (
          await readFile(path, {
            flag: 'r',
          })
        )
          .toString()
          .split(/\r?\n/)
          .slice(startLine, endLine + 1)
          .join('\r\n'),
      })),
    );

    timer.add('CompletionGenerate', 'GotRelativeDefinitions');

    return result;
  }
}
