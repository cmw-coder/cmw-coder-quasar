import axios from 'axios';
import { DateTime } from 'luxon';
import { v4 as uuid } from 'uuid';

import { constructData } from 'main/components/StatisticsReporter/utils';
import { configStore } from 'main/stores';
import { CaretPosition } from 'shared/types/common';
import { PromptElements } from 'main/components/PromptExtractor/types';
import { Completions } from 'main/components/PromptProcessor/types';
import { timer } from 'main/utils/timer';

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
}

class StatisticsReporter {
  private _api = axios.create({
    baseURL: configStore.endpoints.statistics,
  });
  private _lastCursorPosition: CaretPosition = { character: -1, line: -1 };
  private _recentCompletion = new Map<string, CompletionData>();

  completionAbort(actionId: string) {
    this._recentCompletion.delete(actionId);
  }

  completionBegin(caretPosition: CaretPosition) {
    timer.add('CompletionGenerate', 'generationStart');
    const actionId = uuid();
    this._recentCompletion.set(actionId, new CompletionData(caretPosition));
    return actionId;
  }

  completionCancel(actionId: string, version: string) {
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

      // TODO: Implement the rest of this method
    }
    this.completionAbort(actionId);
  }

  completionCount(actionId: string): number {
    return (
      this._recentCompletion.get(actionId)?.completions?.candidates.length ?? 0
    );
  }

  completionSelected(
    actionId: string,
    index: number,
    version: string,
  ): string | undefined {
    const data = this._recentCompletion.get(actionId);
    const candidate = data?.select(index);
    if (!data || !candidate) {
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
      this._api
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
            lineLength > 1 ? 'GENE_MULTI' : 'GENE',
          ),
        )
        .catch((e) =>
          console.error('StatisticsReporter.completionSelected', e),
        );
    }
    return candidate;
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

  generationUpdateProjectId(actionId: string, projectId: string) {
    timer.add('CompletionGenerate', 'generationUpdateProjectId');
    const data = this._recentCompletion.get(actionId);
    if (data) {
      data.projectId = projectId;
    }
  }

  generationUpdatePromptElements(actionId: string, elements: PromptElements) {
    timer.add('CompletionGenerate', 'generationUpdatePromptElements');
    const data = this._recentCompletion.get(actionId);
    if (data) {
      data.elements = elements;
    }
  }

  async acceptCompletion(actionId: string, index: number, version: string) {
    const data = this._recentCompletion.get(actionId);
    const candidate = data?.select(index);
    if (!data || !data.projectId || !candidate) {
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
      await this._api.post(
        '/report/summary',
        constructData(
          lineLength,
          data.timelines.startAccept.toMillis(),
          DateTime.now().toMillis(),
          data.projectId,
          version,
          configStore.modelType,
          'CODE',
          lineLength > 1 ? 'KEEP_MULTI' : 'KEEP',
        ),
      );
    } catch (e) {
      console.error('StatisticsReporter.acceptFailed', e);
    }

    this.completionAbort(actionId);
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
      await this._api.post(
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
