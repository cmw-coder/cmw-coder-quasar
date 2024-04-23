import { DateTime } from 'luxon';
import { PromptElements } from 'main/components/PromptExtractor/types';
import { Completions } from 'main/components/PromptProcessor/types';
import { CaretPosition } from 'shared/types/common';

export interface CollectionData {
  createTime: string;
  prefix: string;
  suffix: string;
  path: string;
  similarSnippet: string;
  symbolList: string[];
  answer: string[];
  acceptAnswerIndex: number;
  accept: 0 | 1;
  afterCode: string;
  plugin: 'SI';
  projectId: string;
  fileSuffix: string;
}

export class CompletionData {
  private _checked = new Set<number>();
  private _lastChecked: number = -1;

  completions?: Completions;
  elements?: PromptElements;
  position: CaretPosition;
  projectId?: string;
  timelines: {
    startGenerate: DateTime;
    endGenerate: DateTime;
    startAccept: DateTime;
  };

  constructor(caretPosition: CaretPosition) {
    this.position = caretPosition;
    this.timelines = {
      startGenerate: DateTime.now(),
      endGenerate: DateTime.invalid('Uninitialized'),
      startAccept: DateTime.invalid('Uninitialized'),
    };
  }

  select(index: number): string | undefined {
    if (!this.timelines.startAccept.isValid) {
      this.timelines.startAccept = DateTime.now();
    }

    const candidate = this.completions?.candidates[index];
    if (candidate) {
      this._checked.add(index);
      this._lastChecked = index;
    }
    return candidate;
  }

  get lastChecked(): number {
    return this._lastChecked;
  }
}

export enum KeptRatio {
  All = 'All',
  Few = 'Few',
  Most = 'Most',
  None = 'None',
}
