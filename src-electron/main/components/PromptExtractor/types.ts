import { SeparateTokens } from 'main/stores/config/types';

export class PromptElements {
  file?: string;
  folder?: string;
  language?: string;
  prefix: string;
  similarSnippet?: string;
  suffix: string;
  symbols?: string;

  constructor(prefix: string, suffix: string) {
    this.prefix = prefix;
    this.suffix = suffix;
  }

  constructQuestion() {
    const result = Array<string>();
    if (this.similarSnippet) {
      result.push(this.similarSnippet);
    }
    if (this.symbols) {
      result.push(this.symbols);
    }
    result.push(this.prefix);
    return result.join('\r\n');
  }

  stringify(separateTokens: SeparateTokens) {
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
    result.push(start + this.constructQuestion());
    result.push(end + this.suffix);
    result.push(middle);
    return result.join('');
  }
}

export interface RelativeDefinition {
  path: string;
  content: string;
}

export interface SimilarSnippet {
  path: string;
  score: number;
  content: string;
}

export interface SimilarSnippetConfig {
  contextLines: number;
  limit: number;
  minScore: number;
}

export enum SupportedSymbol {
  //! Remove function definitions for now
  Enum = 'Enum',
  Interface = 'Interface',
  Array = 'Array',
  Object = 'Object',
  Struct = 'Struct',
}
