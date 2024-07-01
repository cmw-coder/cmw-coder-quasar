import { Range } from 'main/types/vscode/range';
import type { BundledLanguage } from 'shiki';

export interface Selection {
  file: string;
  content: string;
  range: Range;
  language: BundledLanguage;
}

export interface TriggerPosition {
  x: number;
  y: number;
}
