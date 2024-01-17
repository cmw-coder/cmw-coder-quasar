export interface CaretPosition {
  character: number;
  line: number;
}

export enum CompletionType {
  Function = 'Function',
  Line = 'Line',
  Snippet = 'Snippet',
}

export interface SymbolInfo {
  endLine: number;
  name: string;
  path: string;
  startLine: number;
}
