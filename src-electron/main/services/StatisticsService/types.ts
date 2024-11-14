import { DateTime } from 'luxon';
import { basename, extname, join } from 'path';

import { PromptElements } from 'main/components/PromptExtractor/types';
import { CaretPosition, Completions } from 'shared/types/common';

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
  accept: -1 | 0 | 1;
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
  };
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
    coderEndFrequentFunctions: DateTime;
    coderEndGlobals: DateTime;
    coderEndIncludes: DateTime;
    coderEndSimilarSnippets: DateTime;
    coderEndRagCode: DateTime;
    coderEndRelativeDefinitions: DateTime;
    coderEndGetPromptComponents: DateTime;
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
      coderEndFrequentFunctions: DateTime.invalid('Uninitialized'),
      coderEndGlobals: DateTime.invalid('Uninitialized'),
      coderEndIncludes: DateTime.invalid('Uninitialized'),
      coderEndSimilarSnippets: DateTime.invalid('Uninitialized'),
      coderEndRagCode: DateTime.invalid('Uninitialized'),
      coderEndRelativeDefinitions: DateTime.invalid('Uninitialized'),
      coderEndGetPromptComponents: DateTime.invalid('Uninitialized'),
      coderEndConstructPrompt: DateTime.invalid('Uninitialized'),
      coderEndRequest: DateTime.invalid('Uninitialized'),
      coderEndPostProcess: DateTime.invalid('Uninitialized'),
      coderStartAccept: DateTime.invalid('Uninitialized'),
    };
  }

  serialize(accept: -1 | 0 | 1, editedContent: string): CollectionData {
    if (!this.elements || !this.completions || !this.projectId) {
      throw new Error('Invalid completion data');
    }
    return {
      createTime: this.timelines.proxyEndEditorInfo.toFormat(
        'yyyy-MM-dd HH:mm:ss',
      ),
      prefix: this.elements.slicedPrefix,
      suffix: this.elements.slicedSuffix,
      repo: this.elements.repo ?? '',
      path: join(this.elements.folder ?? '', this.elements.file ?? ''),
      fileSuffix: this.elements.file
        ? extname(basename(this.elements.file))
        : '',
      similarSnippet: this.elements.similarSnippet ?? '',
      symbolList: this.elements.symbols ? [this.elements.symbols] : [],
      model: this.model ?? '',
      templateName: this.templateName ?? '',
      answer: this.completions.candidates,
      acceptAnswerIndex: this.lastChecked,
      accept: accept,
      afterCode: editedContent,
      plugin: 'SI',
      projectId: this.projectId,
      latency: {
        editorInfo: this.timelines.proxyStartSymbolInfo.diff(
          this.timelines.proxyStartEditorInfo,
        ).milliseconds,
        symbolLocation: this.timelines.proxyEndEditorInfo.diff(
          this.timelines.proxyStartSymbolInfo,
        ).milliseconds,
        similarSnippets: this.timelines.coderEndSimilarSnippets.isValid
          ? this.timelines.coderEndSimilarSnippets.diff(
              this.timelines.proxyEndEditorInfo,
            ).milliseconds
          : 0,
        symbolData: this.timelines.coderEndRelativeDefinitions.isValid
          ? this.timelines.coderEndRelativeDefinitions.diff(
              this.timelines.proxyEndEditorInfo,
            ).milliseconds
          : 0,
        prompt: this.timelines.coderEndConstructPrompt.diff(
          this.timelines.proxyEndEditorInfo,
        ).milliseconds,
        request: this.timelines.coderEndRequest.diff(
          this.timelines.coderEndConstructPrompt,
        ).milliseconds,
        postProcess: this.timelines.coderEndPostProcess.diff(
          this.timelines.coderEndRequest,
        ).milliseconds,
        total: this.timelines.coderStartAccept.diff(
          this.timelines.proxyStartEditorInfo,
        ).milliseconds,
      },
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
