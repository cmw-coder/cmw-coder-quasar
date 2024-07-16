import { Range } from 'main/types/vscode/range';
import type { BundledLanguage } from 'shiki';

export interface Selection {
  block: string;
  file: string;
  content: string;
  range: Range;
  language: BundledLanguage;
}

export interface TriggerPosition {
  x: number;
  y: number;
}

export interface ExtraData {
  projectId: string;
  version: string;
}
