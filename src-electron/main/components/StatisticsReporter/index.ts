import axios from 'axios';
import { DateTime } from 'luxon';
import { basename, extname } from 'path';
import { v4 as uuid } from 'uuid';

import { configStore } from 'main/stores';
import { CaretPosition } from 'shared/types/common';
import { PromptElements } from 'main/components/PromptExtractor/types';
import { Completions } from 'main/components/PromptProcessor/types';
import {
  CollectionData,
  KeptRatio,
} from 'main/components/StatisticsReporter/types';
import { constructData } from 'main/components/StatisticsReporter/utils';
import { timer } from 'main/utils/timer';
import {
  skuNameAcceptMapping,
  skuNameGenerateMapping,
  skuNameKeptMapping,
} from 'main/components/StatisticsReporter/constants';

class CompletionData {
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

class StatisticsReporter {
  private _collectionApi = axios.create({
    baseURL: configStore.endpoints.collection,
  });
  private _statisticsApi = axios.create({
    baseURL: configStore.endpoints.statistics,
  });
  private _lastCursorPosition: CaretPosition = { character: -1, line: -1 };
  private _recentCompletion = new Map<string, CompletionData>();

  constructor() {
    setInterval(() => {
      for (const [actionId, data] of this._recentCompletion) {
        if (data.timelines.startGenerate.isValid) {
          const now = DateTime.now();
          if (now.diff(data.timelines.startGenerate).as('minutes') > 30) {
            this.completionAbort(actionId);
          }
        }
      }
    }, 1000 * 60);
  }

  completionAbort(actionId: string) {
    this._recentCompletion.delete(actionId);
  }

  async completionAccept(actionId: string, index: number, version: string) {
    const data = this._recentCompletion.get(actionId);
    const candidate = data?.select(index);
    if (!data || !data.completions || !data.projectId || !candidate) {
      return;
    }

    console.debug('StatisticsReporter.acceptCompletion', {
      completions: data.completions,
      position: data.position,
      projectId: data.projectId,
      timelines: data.timelines,
      version,
    });

    this._lastCursorPosition.character = -1;
    this._lastCursorPosition.line = -1;

    const lineLength = candidate.split('\r\n').length;
    try {
      await this._statisticsApi.post(
        '/report/summary',
        constructData(
          lineLength,
          data.timelines.startAccept.toMillis(),
          DateTime.now().toMillis(),
          data.projectId,
          version,
          configStore.modelType,
          'CODE',
          skuNameAcceptMapping[data.completions.type],
        ),
      );
    } catch (e) {
      console.error('StatisticsReporter.completionAccept.failed', e);
    }
  }

  completionBegin(caretPosition: CaretPosition) {
    timer.add('CompletionGenerate', 'generationStart');
    const actionId = uuid();
    this._recentCompletion.set(actionId, new CompletionData(caretPosition));
    return actionId;
  }

  async completionCancel(actionId: string, version: string) {
    const data = this._recentCompletion.get(actionId);
    if (!data) {
      return;
    }

    if (
      data.position.character >= 0 &&
      data.position.line >= 0 &&
      data.position.line != this._lastCursorPosition.line
    ) {
      // TODO: Check if this works
      this._lastCursorPosition = data.position;
      console.debug('StatisticsReporter.completionCancel', {
        completions: data.completions,
        position: data.position,
        projectId: data.projectId,
        timelines: data.timelines,
        version,
      });

      if (data.completions && data.elements && data.projectId) {
        try {
          await this._collectionApi.post('/v2', {
            createTime: data.timelines.startGenerate.toFormat(
              'yyyy-MM-dd HH:mm:ss',
            ),
            prefix: data.elements.prefix,
            suffix: data.elements.suffix,
            path: data.elements.file ?? '',
            similarSnippet: data.elements.similarSnippet ?? '',
            symbolList: data.elements.symbols ? [data.elements.symbols] : [],
            answer: data.completions.candidates,
            acceptAnswerIndex: data.lastChecked,
            accept: 0,
            afterCode: '',
            plugin: 'SI',
            projectId: data.projectId,
            fileSuffix: data.elements.file
              ? extname(basename(data.elements.file))
              : '',
          } satisfies CollectionData);
        } catch (e) {
          console.error('StatisticsReporter.completionKept.failed', e);
        }
      }
    }
    this.completionAbort(actionId);
  }

  completionCount(actionId: string): number {
    return (
      this._recentCompletion.get(actionId)?.completions?.candidates.length ?? 0
    );
  }

  completionGenerated(actionId: string, completions: Completions) {
    timer.add('CompletionGenerate', 'completionGenerated');
    const data = this._recentCompletion.get(actionId);
    if (!data) {
      return;
    }
    data.completions = completions;
    if (data.timelines) {
      data.timelines.endGenerate = DateTime.now();
    }
  }

  async completionKept(
    actionId: string,
    count: number,
    editedContent: string,
    ratio: KeptRatio,
    version: string,
  ) {
    const data = this._recentCompletion.get(actionId);
    if (!data || !data.completions || !data.elements || !data.projectId) {
      return;
    }

    console.debug('StatisticsReporter.completionKept', {
      count,
      ratio,
    });

    try {
      await Promise.all([
        this._collectionApi.post('/v2', {
          createTime: data.timelines.startGenerate.toFormat(
            'yyyy-MM-dd HH:mm:ss',
          ),
          prefix: data.elements.prefix,
          suffix: data.elements.suffix,
          path: data.elements.file ?? '',
          similarSnippet: data.elements.similarSnippet ?? '',
          symbolList: data.elements.symbols ? [data.elements.symbols] : [],
          answer: data.completions.candidates,
          acceptAnswerIndex: data.lastChecked,
          accept: 1,
          afterCode: editedContent,
          plugin: 'SI',
          projectId: data.projectId,
          fileSuffix: data.elements.file
            ? extname(basename(data.elements.file))
            : '',
        } satisfies CollectionData),
        this._statisticsApi.post(
          '/report/summary',
          constructData(
            count,
            data.timelines.startAccept.toMillis(),
            DateTime.now().toMillis(),
            data.projectId,
            version,
            configStore.modelType,
            'CODE',
            skuNameKeptMapping[ratio],
          ),
        ),
      ]);
    } catch (e) {
      console.error('StatisticsReporter.completionKept.failed', e);
    }
    statisticsReporter.completionAbort(actionId);
  }

  completionSelected(
    actionId: string,
    index: number,
    version: string,
  ): string | undefined {
    const data = this._recentCompletion.get(actionId);
    const candidate = data?.select(index);
    if (!data || !data.completions || !candidate) {
      return;
    }

    if (
      data.projectId &&
      data.position.character >= 0 &&
      data.position.line >= 0 &&
      data.position.line != this._lastCursorPosition.line
    ) {
      console.debug('StatisticsReporter.completionSelected', {
        completions: data.completions,
        position: data.position,
        projectId: data.projectId,
        timelines: data.timelines,
        version,
      });
      const lineLength = candidate.split('\r\n').length;
      this._statisticsApi
        .post(
          '/report/summary',
          constructData(
            lineLength,
            data.timelines.startGenerate.toMillis(),
            data.timelines.endGenerate.toMillis(),
            data.projectId,
            version,
            configStore.modelType,
            'CODE',
            skuNameGenerateMapping[data.completions.type],
          ),
        )
        .catch((e) =>
          console.error('StatisticsReporter.completionSelected', e),
        );
    }
    return candidate;
  }

  completionUpdateProjectId(actionId: string, projectId: string) {
    timer.add('CompletionGenerate', 'generationUpdateProjectId');
    const data = this._recentCompletion.get(actionId);
    if (data) {
      data.projectId = projectId;
    }
  }

  completionUpdatePromptElements(actionId: string, elements: PromptElements) {
    timer.add('CompletionGenerate', 'generationUpdatePromptElements');
    const data = this._recentCompletion.get(actionId);
    if (data) {
      data.elements = elements;
    }
  }

  async copiedLines(count: number, projectId: string, version: string) {
    console.log('StatisticsReporter.copiedLines', {
      count,
      projectId,
      version,
    });
    try {
      await this._statisticsApi.post(
        '/report/summary',
        constructData(
          count,
          Date.now(),
          Date.now(),
          projectId,
          version,
          configStore.modelType,
          'INC_CHAR',
          '',
        ),
      );
    } catch (e) {
      console.error('StatisticsReporter.copiedLinesFailed', e);
    }
  }

  async incrementLines(
    count: number,
    startTime: number,
    endTime: number,
    projectId: string,
    version: string,
  ) {
    console.log('StatisticsReporter.incrementLines', {
      count,
      startTime,
      endTime,
      projectId,
      version,
    });
    try {
      await this._statisticsApi.post(
        '/report/summary',
        constructData(
          count,
          startTime,
          endTime,
          projectId,
          version,
          configStore.modelType,
          'INC',
          '',
        ),
      );
    } catch (e) {
      console.error('StatisticsReporter.incrementLinesFailed', e);
    }
  }
}

export const statisticsReporter = new StatisticsReporter();
