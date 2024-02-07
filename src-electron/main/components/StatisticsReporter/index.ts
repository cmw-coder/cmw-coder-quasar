import axios from 'axios';

import { constructData } from 'main/components/StatisticsReporter/utils';
import { configStore } from 'main/stores';
import { CaretPosition } from 'shared/types/common';

class StatisticsReporter {
  private _api = axios.create({
    baseURL: configStore.endpoints.statistics,
  });
  private _currentCursor: CaretPosition = { character: -1, line: -1 };
  private _lastCursor: CaretPosition = { character: -1, line: -1 };

  async acceptCompletion(
    completion: string,
    startTime: number,
    endTime: number,
    projectId: string,
    version: string,
  ) {
    this._currentCursor.character = -1;
    this._currentCursor.line = -1;
    console.log('StatisticsReporter.acceptCompletion', {
      completion,
      startTime,
      endTime,
      projectId,
      version,
    });
    const lineLength = completion.split('\r\n').length;
    try {
      await this._api.post(
        '/report/summary',
        constructData(
          lineLength,
          startTime,
          endTime,
          projectId,
          version,
          configStore.modelType,
          'CODE',
          lineLength > 1 ? 'KEEP_MULTI' : 'KEEP',
        ),
      );
    } catch (e) {
      console.error('StatisticsReporter.acceptFailed', e);
    }
  }

  async generateCompletion(
    completion: string,
    startTime: number,
    endTime: number,
    projectId: string,
    version: string,
  ) {
    if (
      this._currentCursor.character >= 0 &&
      this._currentCursor.line >= 0 &&
      this._currentCursor.line == this._lastCursor.line
    ) {
      return;
    }
    console.log('StatisticsReporter.generateCompletion', {
      completion,
      startTime,
      endTime,
      projectId,
      version,
    });
    const lineLength = completion.split('\r\n').length;
    try {
      await this._api.post(
        '/report/summary',
        constructData(
          lineLength,
          startTime,
          endTime,
          projectId,
          version,
          configStore.modelType,
          'CODE',
          lineLength > 1 ? 'GENE_MULTI' : 'GENE',
        ),
      );
    } catch (e) {
      console.error('StatisticsReporter.generateFailed', e);
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

  updateCaretPosition(caret: CaretPosition) {
    this._lastCursor = this._currentCursor;
    this._currentCursor = caret;
  }
}

export const statisticsReporter = new StatisticsReporter();
