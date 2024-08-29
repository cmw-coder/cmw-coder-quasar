import { injectable } from 'inversify';
import { DateTime } from 'luxon';
import { extname, basename, join } from 'path';
import { uid } from 'quasar';

import { PromptElements } from 'main/components/PromptExtractor/types';
import { Completions } from 'main/components/PromptProcessor/types';
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
  CollectionData,
  CompletionData,
  CopyPasteData,
  KeptRatio,
} from 'main/services/StatisticsService/types';
import { constructData } from 'main/services/StatisticsService/utils';
import { NEW_LINE_REGEX } from 'shared/constants/common';
import { CaretPosition } from 'shared/types/common';
import { StatisticsServiceTrait } from 'shared/types/service/StatisticsServiceTrait';
import statisticsLog from 'main/components/Loggers/statisticsLog';

@injectable()
export class StatisticsService implements StatisticsServiceTrait {
  private _lastCursorPosition: CaretPosition = { character: -1, line: -1 };
  private _recentCompletion = new Map<string, CompletionData>();

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

  completionAbort(actionId: string) {
    this._recentCompletion.delete(actionId);
  }

  async completionAccept(actionId: string, index: number, version: string) {
    const data = this._recentCompletion.get(actionId);
    const candidate = data?.select(index);
    if (!data || !data.completions || !data.projectId || !candidate) {
      return;
    }

    statisticsLog.debug('StatisticsReporter.completionAccept', {
      completions: data.completions,
      position: data.position,
      projectId: data.projectId,
      timelines: {
        startGenerate: data.timelines.proxyEndEditorInfo.toFormat(
          'yyyy-MM-dd HH:mm:ss:SSS',
        ),
        endGenerate: data.timelines.coderEndPostProcess.toFormat(
          'yyyy-MM-dd HH:mm:ss:SSS',
        ),
        startAccept: data.timelines.coderStartAccept.toFormat(
          'yyyy-MM-dd HH:mm:ss:SSS',
        ),
      },
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
      statisticsLog.error('StatisticsReporter.completionAccept.failed', e);
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
      statisticsLog.debug('StatisticsReporter.completionCancel', {
        position: data.position,
        projectId: data.projectId,
        timelines: {
          startGenerate: data.timelines.proxyEndEditorInfo.toFormat(
            'yyyy-MM-dd HH:mm:ss:SSS',
          ),
          endGenerate: data.timelines.coderEndPostProcess.toFormat(
            'yyyy-MM-dd HH:mm:ss:SSS',
          ),
          startAccept: data.timelines.coderStartAccept.toFormat(
            'yyyy-MM-dd HH:mm:ss:SSS',
          ),
        },
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
    if (!data || !data.completions || !data.elements || !data.projectId) {
      return;
    }

    statisticsLog.debug({ timelines: data.timelines });

    const requestData: CollectionData = {
      createTime: data.timelines.proxyEndEditorInfo.toFormat(
        'yyyy-MM-dd HH:mm:ss',
      ),
      prefix: data.elements.prefix,
      suffix: data.elements.suffix,
      repo: data.elements.repo ?? '',
      path: join(data.elements.folder ?? '', data.elements.file ?? ''),
      fileSuffix: data.elements.file
        ? extname(basename(data.elements.file))
        : '',
      similarSnippet: data.elements.similarSnippet ?? '',
      symbolList: data.elements.symbols ? [data.elements.symbols] : [],
      model: data.model ?? '',
      templateName: data.templateName ?? '',
      answer: data.completions.candidates,
      acceptAnswerIndex: data.lastChecked,
      accept: ratio === KeptRatio.None ? 0 : 1,
      afterCode: editedContent,
      plugin: 'SI',
      projectId: data.projectId,
      latency: {
        editorInfo: data.timelines.proxyStartSymbolInfo.diff(
          data.timelines.proxyStartEditorInfo,
        ).milliseconds,
        symbolLocation: data.timelines.proxyEndEditorInfo.diff(
          data.timelines.proxyStartSymbolInfo,
        ).milliseconds,
        similarSnippets: data.timelines.coderEndSimilarSnippets.isValid
          ? data.timelines.coderEndSimilarSnippets.diff(
              data.timelines.proxyEndEditorInfo,
            ).milliseconds
          : 0,
        symbolData: data.timelines.coderEndRelativeDefinitions.isValid
          ? data.timelines.coderEndRelativeDefinitions.diff(
              data.timelines.proxyEndEditorInfo,
            ).milliseconds
          : 0,
        prompt: data.timelines.coderEndConstructPrompt.diff(
          data.timelines.proxyEndEditorInfo,
        ).milliseconds,
        request: data.timelines.coderEndRequest.diff(
          data.timelines.coderEndConstructPrompt,
        ).milliseconds,
        postProcess: data.timelines.coderEndPostProcess.diff(
          data.timelines.coderEndRequest,
        ).milliseconds,
        total: data.timelines.coderStartAccept.diff(
          data.timelines.proxyStartEditorInfo,
        ).milliseconds,
      },
    };

    statisticsLog.debug('StatisticsReporter.completionKept', { requestData });

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
      statisticsLog.error('StatisticsReporter.completionKept.failed', e);
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
      statisticsLog.debug('StatisticsReporter.completionSelected', {
        completions: data.completions,
        position: data.position,
        projectId: data.projectId,
        timelines: {
          startGenerate: data.timelines.proxyEndEditorInfo.toFormat(
            'yyyy-MM-dd HH:mm:ss:SSS',
          ),
          endGenerate: data.timelines.coderEndPostProcess.toFormat(
            'yyyy-MM-dd HH:mm:ss:SSS',
          ),
          startAccept: data.timelines.coderStartAccept.toFormat(
            'yyyy-MM-dd HH:mm:ss:SSS',
          ),
        },
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

  async copiedContents(data: CopyPasteData) {
    statisticsLog.debug('StatisticsReporter.copiedContents', data);
    try {
      await api_collection_copy(data);
    } catch (e) {
      statisticsLog.error('StatisticsReporter.copiedContents.failed', e);
    }
  }

  async copiedLines(count: number, projectId: string, version: string) {
    statisticsLog.debug('StatisticsReporter.copiedLines', {
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
          'INC_CHAR',
          '',
        ),
      );
    } catch (e) {
      statisticsLog.error('StatisticsReporter.copiedLines.failed', e);
    }
  }

  async incrementLines(
    count: number,
    startTime: number,
    endTime: number,
    projectId: string,
    version: string,
  ) {
    statisticsLog.debug('StatisticsReporter.incrementLines', {
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
      statisticsLog.error('StatisticsReporter.incrementLinesFailed', e);
    }
  }
}
