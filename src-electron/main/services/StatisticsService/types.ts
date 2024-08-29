import { DateTime } from 'luxon';
import { PromptElements } from 'main/components/PromptExtractor/types';
import { Completions } from 'main/components/PromptProcessor/types';
import { CaretPosition } from 'shared/types/common';

export interface CollectionData {
  createTime: string;
  prefix: string;
  suffix: string;
  repo: string;
  path: string;
  fileSuffix: string;
  similarSnippet: string;
  symbolList: string[];
  model: string;
  templateName: string;
  answer: string[];
  acceptAnswerIndex: number;
  accept: 0 | 1;
  afterCode: string;
  plugin: 'SI';
  projectId: string;
  latency: {
    editorInfo: number;
    symbolLocation: number;
    similarSnippets: number;
    symbolData: number;
    prompt: number;
    request: number;
    postProcess: number;
    total: number;
  };
}

export interface CopyPasteData {
  content: string;
  context: {
    prefix: string;
    suffix: string;
  }
  path: string;
  position: CaretPosition;
  projectId: string;
  recentFiles: string[];
  repo: string;
  svn: string[];
  userId: string;
}

export class CompletionData {
  private _checked = new Set<number>();
  private _lastChecked: number = -1;

  completions?: Completions;
  elements?: PromptElements;
  model?: string;
  templateName?: string;
  position: CaretPosition;
  projectId?: string;
  timelines: {
    proxyStartEditorInfo: DateTime;
    proxyStartSymbolInfo: DateTime;
    proxyEndEditorInfo: DateTime;
    coderEndSimilarSnippets: DateTime;
    coderEndRelativeDefinitions: DateTime;
    coderEndConstructPrompt: DateTime;
    coderEndRequest: DateTime;
    coderEndPostProcess: DateTime;
    coderStartAccept: DateTime;
  };

  constructor(
    caretPosition: CaretPosition,
    start: number,
    symbol: number,
    end: number,
  ) {
    this.position = caretPosition;
    this.timelines = {
      proxyStartEditorInfo: DateTime.fromMillis(start),
      proxyStartSymbolInfo: DateTime.fromMillis(symbol),
      proxyEndEditorInfo: DateTime.fromMillis(end),
      coderEndSimilarSnippets: DateTime.invalid('Uninitialized'),
      coderEndRelativeDefinitions: DateTime.invalid('Uninitialized'),
      coderEndConstructPrompt: DateTime.invalid('Uninitialized'),
      coderEndRequest: DateTime.invalid('Uninitialized'),
      coderEndPostProcess: DateTime.invalid('Uninitialized'),
      coderStartAccept: DateTime.invalid('Uninitialized'),
    };
  }

  select(index: number): string | undefined {
    if (!this.timelines.coderStartAccept.isValid) {
      this.timelines.coderStartAccept = DateTime.now();
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
