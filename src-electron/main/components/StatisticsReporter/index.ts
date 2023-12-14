import axios from 'axios';

import { constructData } from 'main/components/StatisticsReporter/utils';
import { configStore, dataStore } from 'main/stores';
import { CaretPosition } from 'shared/types/common';

class StatisticsReporter {
  private _currentCursor: CaretPosition = new CaretPosition();
  private _lastCursor: CaretPosition = new CaretPosition();

  async acceptCompletion(
    completion: string,
    startTime: number,
    endTime: number,
    projectId: string,
    version: string,
    username: string
  ) {
    if (
      this._currentCursor.isValid() &&
      this._currentCursor.line == this._lastCursor.line
    ) {
      return;
    }
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
            username,
            dataStore.modelType ?? configStore.defaultModelType,
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
    version: string,
    username: string
  ) {
    if (
      this._currentCursor.isValid() &&
      this._currentCursor.line == this._lastCursor.line
    ) {
      return;
    }
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
            username,
            dataStore.modelType ?? configStore.defaultModelType,
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
