import { Range } from 'main/types/vscode/range';

export interface Selection {
  file: string;
  content: string;
  range: Range;
}

export interface TriggerPosition {
  x: number;
  y: number;
}
