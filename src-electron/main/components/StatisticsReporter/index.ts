import axios from 'axios';

import { constructData } from 'main/components/StatisticsReporter/utils';
import { configStore } from 'main/stores';
import { CaretPosition } from 'shared/types/common';

class StatisticsReporter {
  private _currentCursor: CaretPosition = { character: -1, line: -1 };
  private _lastCursor: CaretPosition = { character: -1, line: -1 };

  async acceptCompletion(
    completion: string,
    startTime: number,
    endTime: number,
    projectId: string,
    version: string
  ) {
    if (
      this._currentCursor.character >= 0 &&
      this._currentCursor.line >= 0 &&
      this._currentCursor.line == this._lastCursor.line
    ) {
      return;
    }
    console.log('StatisticsReporter.acceptCompletion', {
      completion,
      startTime,
      endTime,
      projectId,
      version,
    });
    try {
      await axios
        .create({
          baseURL: configStore.statistics,
        })
        .post(
          '/report/summary',
          constructData(
            completion,
            startTime,
            endTime,
            projectId,
            version,
            configStore.modelType,
            true
          )
        );
    } catch (e) {
      console.error('StatisticsReporter.accept', e);
    }
  }

  async generateCompletion(
    completion: string,
    startTime: number,
    endTime: number,
    projectId: string,
    version: string
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
    try {
      await axios
        .create({
          baseURL: configStore.statistics,
        })
        .post(
          '/report/summary',
          constructData(
            completion,
            startTime,
            endTime,
            projectId,
            version,
            configStore.modelType,
            false
          )
        );
    } catch (e) {
      console.error('StatisticsReporter.generate', e);
    }
  }

  updateCaretPosition(caret: CaretPosition) {
    this._lastCursor = this._currentCursor;
    this._currentCursor = caret;
  }
}

export const statisticsReporter = new StatisticsReporter();
