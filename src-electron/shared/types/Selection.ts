import { Range } from 'main/types/vscode/range';

export interface Selection {
  block: string;
  file: string;
  content: string;
  range: Range;
  language: string;
}

export interface TriggerPosition {
  x: number;
  y: number;
}

export interface ExtraData {
  projectId: string;
  version: string;
}
