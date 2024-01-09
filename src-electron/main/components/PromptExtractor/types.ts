import { SeparateTokens } from 'main/stores/config/types';

export interface PromptElements {
  file?: string;
  folder?: string;
  language?: string;
  prefix: string;
  similarSnippet?: string;
  suffix: string;
  symbols?: string;
}

export class PromptElements {
  constructor(prefix: string, suffix: string) {
    this.prefix = prefix;
    this.suffix = suffix;
  }

  constructQuestion() {
    const result = Array<string>();
    if (this.language) {
      result.push(`<language>${this.language}`);
    }
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
      result.push(`<reponame>${this.folder}`);
    }
    if (this.file) {
      result.push(`<filename>${this.file}`);
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
