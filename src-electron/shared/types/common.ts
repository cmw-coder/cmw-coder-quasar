export interface CaretPosition {
  character: number;
  line: number;
}

export enum CompletionType {
  Function = 'Function',
  Line = 'Line',
  Snippet = 'Snippet',
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
