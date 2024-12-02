export class CaretPosition {
  public readonly character: number;
  public readonly line: number;

  constructor(line: number = -1, character: number = -1) {
    this.character = character;
    this.line = line;
  }

  get isValid(): boolean {
    return this.line >= 0 && this.character >= 0;
  }

  compareTo(other: CaretPosition): -1 | 0 | 1 {
    if (this.line < other.line) {
      return -1;
    } else if (this.line > other.line) {
      return 1;
    } else if (this.character < other.character) {
      return -1;
    } else if (this.character > other.character) {
      return 1;
    } else {
      return 0;
    }
  }
}

export enum CompletionType {
  Function = 'Function',
  Line = 'Line',
  Snippet = 'Snippet',
}

export interface Completions {
  candidates: string[];
  type: CompletionType;
}

export enum GenerateType {
  Common = 'Common',
  PasteReplace = 'PasteReplace',
}

export enum KeptRatio {
  All = 'All',
  Few = 'Few',
  Most = 'Most',
  None = 'None',
}

export class Selection {
  public readonly begin = new CaretPosition();
  public readonly end = new CaretPosition();

  constructor(
    begin: CaretPosition = new CaretPosition(),
    end: CaretPosition = new CaretPosition(),
  ) {
    if (begin.isValid && end.isValid) {
      if (begin.compareTo(end) > 0) {
        this.begin = end;
        this.end = begin;
      } else {
        this.begin = begin;
        this.end = end;
      }
    }
  }

  get isValid(): boolean {
    return this.begin.isValid && this.end.isValid;
  }
}

export interface SimilarSnippet {
  path: string;
  score: number;
  content: string;
}

export interface SymbolInfo {
  endLine: number;
  name: string;
  path: string;
  startLine: number;
  type: SymbolType;
}

export enum SymbolType {
  Enum = 'Enum',
  Function = 'Function',
  Macro = 'Macro',
  Reference = 'Reference',
  Struct = 'Struct',
  Unknown = 'Unknown',
  Variable = 'Variable',
}
