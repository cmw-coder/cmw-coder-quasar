import { injectable } from 'inversify';
import { DateTime } from 'luxon';
import { uid } from 'quasar';

import { PromptElements } from 'main/components/PromptExtractor/types';
import {
  api_collection_code_v2,
  api_collection_copy,
  api_reportSKU,
} from 'main/request/sku';
import {
  skuNameAcceptMapping,
  skuNameGenerateMapping,
  skuNameKeptMapping,
} from 'main/services/StatisticsService/constants';
import {
  CompletionData,
  CopyPasteData,
} from 'main/services/StatisticsService/types';
import {
  constructData,
  formatTimelines,
} from 'main/services/StatisticsService/utils';
import { NEW_LINE_REGEX } from 'shared/constants/common';
import {
  CaretPosition,
  Completions,
  CompletionType,
  KeptRatio,
} from 'shared/types/common';
import { StatisticsServiceTrait } from 'shared/types/service/StatisticsServiceTrait';
import statisticsLog from 'main/components/Loggers/statisticsLog';
import { FileRecorderManager } from 'main/services/StatisticsService/FileRecorderManager';

@injectable()
export class StatisticsService implements StatisticsServiceTrait {
  private _lastCursorPosition: CaretPosition = { character: -1, line: -1 };
  private _recentCompletion = new Map<string, CompletionData>();
  private _fileRecorderManager = new FileRecorderManager();

  constructor() {
    setInterval(() => {
      for (const [actionId, data] of this._recentCompletion) {
        if (data.timelines.proxyEndEditorInfo.isValid) {
          const now = DateTime.now();
          if (now.diff(data.timelines.proxyEndEditorInfo).as('minutes') > 30) {
            this.completionAbort(actionId);
          }
        }
      }
    }, 1000 * 60);
  }

  get fileRecorderManager() {
    return this._fileRecorderManager;
  }

  completionAbort(actionId: string) {
    this._recentCompletion.delete(actionId);
  }

  async completionAccept(actionId: string, index: number, version: string) {
    const data = this._recentCompletion.get(actionId);
    const candidate = data?.select(index);
    if (!data || !data.completions || !data.projectId || !candidate) {
      this.completionAbort(actionId);
      return;
    }

    statisticsLog.debug('completionAccept', {
      completions: data.completions,
      position: data.position,
      projectId: data.projectId,
      timelines: formatTimelines(data.timelines),
      version,
    });

    this._lastCursorPosition.character = -1;
    this._lastCursorPosition.line = -1;

    const lineLength = candidate.split(NEW_LINE_REGEX).length;
    try {
      await api_reportSKU(
        await constructData(
          lineLength,
          data.timelines.coderStartAccept.toMillis(),
          DateTime.now().toMillis(),
          data.projectId,
          version,
          'CODE',
          skuNameAcceptMapping[data.completions.type],
        ),
      );
    } catch (e) {
      statisticsLog.error('completionAccept.failed', e);
    }
  }

  completionBegin(
    caretPosition: CaretPosition,
    start: number,
    symbol: number,
    end: number,
  ) {
    const actionId = uid();
    this._recentCompletion.set(
      actionId,
      new CompletionData(caretPosition, start, symbol, end),
    );
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
      statisticsLog.debug('completionCancel', {
        position: data.position,
        projectId: data.projectId,
        timelines: formatTimelines(data.timelines),
        version,
      });
    }
  }

  completionCount(actionId: string): number {
    return (
      this._recentCompletion.get(actionId)?.completions?.candidates.length ?? 0
    );
  }

  async completionEdit(
    actionId: string,
    count: number,
    editedContent: string,
    ratio: KeptRatio,
    version: string,
  ) {
    const data = this._recentCompletion.get(actionId);
    const requestData = data?.serialize(
      ratio === KeptRatio.None ? 0 : 1,
      editedContent,
    );
    if (!data || !data.projectId || !requestData) {
      this.completionAbort(actionId);
      return;
    }

    statisticsLog.debug('completionEdit.rawData', {
      actionId,
      count,
      editedContent,
      ratio,
      version,
    });

    statisticsLog.debug('completionEdit.requestData', {
      requestData,
      timelines: formatTimelines(data.timelines),
    });

    try {
      await Promise.all([
        api_collection_code_v2([requestData]),
        ratio === KeptRatio.None
          ? undefined
          : api_reportSKU(
              await constructData(
                count,
                data.timelines.coderStartAccept.toMillis(),
                DateTime.now().toMillis(),
                data.projectId,
                version,
                'CODE',
                skuNameKeptMapping[ratio],
              ),
            ),
      ]);
    } catch (e) {
      statisticsLog.error('completionEdit.failed', e);
    }
    this.completionAbort(actionId);
  }

  completionGenerated(actionId: string, completions: Completions) {
    const data = this._recentCompletion.get(actionId);
    if (!data) {
      return;
    }
    data.completions = completions;
    if (data.timelines) {
      data.timelines.coderEndPostProcess = DateTime.now();
    }
  }

  async completionNoResults(actionId: string) {
    const data = this._recentCompletion.get(actionId);
    if (!data || !data.projectId || !data.timelines) {
      this.completionAbort(actionId);
      return;
    }
    data.completions = { candidates: [], type: CompletionType.Line };
    data.timelines.coderEndPostProcess = DateTime.now();

    const requestData = data?.serialize(-1, '');
    if (!requestData) {
      this.completionAbort(actionId);
      return;
    }

    statisticsLog.debug('completionNoResults', {
      timelines: formatTimelines(data.timelines),
    });

    try {
      await api_collection_code_v2([requestData]);
    } catch (e) {
      statisticsLog.error('completionNoResults.failed', e);
    }
    this.completionAbort(actionId);
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
      statisticsLog.debug('completionSelected', {
        completions: data.completions,
        position: data.position,
        projectId: data.projectId,
        timelines: formatTimelines(data.timelines),
        version,
      });
      const lineLength = candidate.split(NEW_LINE_REGEX).length;
      constructData(
        lineLength,
        data.timelines.proxyEndEditorInfo.toMillis(),
        data.timelines.coderEndPostProcess.toMillis(),
        data.projectId,
        version,
        'CODE',
        skuNameGenerateMapping[data.completions.type],
      )
        .then((data) => api_reportSKU(data))
        .catch((e) => statisticsLog.warn(e));
    }
    return candidate;
  }

  completionUpdateFrequentFunctionsTime(actionId: string) {
    const data = this._recentCompletion.get(actionId);
    if (data) {
      data.timelines.coderEndFrequentFunctions = DateTime.now();
    }
  }

  completionUpdateGlobalsTime(actionId: string) {
    const data = this._recentCompletion.get(actionId);
    if (data) {
      data.timelines.coderEndGlobals = DateTime.now();
    }
  }

  completionUpdateIncludesTime(actionId: string) {
    const data = this._recentCompletion.get(actionId);
    if (data) {
      data.timelines.coderEndIncludes = DateTime.now();
    }
  }

  completionUpdateProjectId(actionId: string, projectId: string) {
    const data = this._recentCompletion.get(actionId);
    if (data) {
      data.projectId = projectId;
    }
  }

  completionUpdatePromptConstructTime(
    actionId: string,
    model: string,
    templateName: string,
  ) {
    const data = this._recentCompletion.get(actionId);
    if (data) {
      data.model = model;
      data.templateName = templateName;
      data.timelines.coderEndConstructPrompt = DateTime.now();
    }
  }

  completionUpdatePromptElements(actionId: string, elements: PromptElements) {
    const data = this._recentCompletion.get(actionId);
    if (data) {
      data.elements = elements;
    }
  }

  completionUpdateRelativeDefinitionsTime(actionId: string) {
    const data = this._recentCompletion.get(actionId);
    if (data) {
      data.timelines.coderEndRelativeDefinitions = DateTime.now();
    }
  }

  completionUpdateRequestEndTime(actionId: string) {
    const data = this._recentCompletion.get(actionId);
    if (data) {
      data.timelines.coderEndRequest = DateTime.now();
    }
  }

  completionUpdateSimilarSnippetsTime(actionId: string) {
    const data = this._recentCompletion.get(actionId);
    if (data) {
      data.timelines.coderEndSimilarSnippets = DateTime.now();
    }
  }

  completionUpdateRagCodeTime(actionId: string) {
    const data = this._recentCompletion.get(actionId);
    if (data) {
      data.timelines.coderEndRagCode = DateTime.now();
    }
  }

  completionUpdateEndGetPromptComponentsTime(actionId: string) {
    const data = this._recentCompletion.get(actionId);
    if (data) {
      data.timelines.coderEndGetPromptComponents = DateTime.now();
    }
  }

  async copiedContents(data: CopyPasteData) {
    statisticsLog.debug('copiedContents', data);
    try {
      await api_collection_copy(data);
    } catch (e) {
      statisticsLog.error('copiedContents.failed', e);
    }
  }

  async copiedLines(count: number, projectId: string, version: string) {
    statisticsLog.debug('copiedLines', {
      count,
      projectId,
      version,
    });
    try {
      await api_reportSKU(
        await constructData(
          count,
          Date.now(),
          Date.now(),
          projectId,
          version,
          'COPY',
          '',
        ),
      );
    } catch (e) {
      statisticsLog.error('copiedLines.failed', e);
    }
  }

  /**
   * @deprecated
   */
  async incrementLines(
    count: number,
    startTime: number,
    endTime: number,
    projectId: string,
    version: string,
  ) {
    statisticsLog.debug('incrementLines', {
      count,
      startTime,
      endTime,
      projectId,
      version,
    });
    try {
      await api_reportSKU(
        await constructData(
          count,
          startTime,
          endTime,
          projectId,
          version,
          'INC',
          '',
        ),
      );
    } catch (e) {
      statisticsLog.error('incrementLinesFailed', e);
    }
  }
}
