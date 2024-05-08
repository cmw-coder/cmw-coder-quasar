import axios from 'axios';
import log from 'electron-log/main';
import { inject, injectable } from 'inversify';
import { DateTime } from 'luxon';
import { extname, basename } from 'path';
import { v4 as uuid } from 'uuid';
import dayjs from 'dayjs';

import { PromptElements } from 'main/components/PromptExtractor/types';
import { Completions } from 'main/components/PromptProcessor/types';
import { timer } from 'main/utils/timer';
import {
  skuNameAcceptMapping,
  skuNameGenerateMapping,
  skuNameKeptMapping,
} from 'service/entities/StatisticsService/constants';
import {
  CollectionData,
  CompletionData,
  KeptRatio,
} from 'service/entities/StatisticsService/types';
import { constructData } from 'service/entities/StatisticsService/utils';
import { ServiceType } from 'shared/services';
import { StatisticsServiceBase } from 'shared/services/types/StatisticsServiceBase';
import { CaretPosition } from 'shared/types/common';
import type { ConfigService } from 'service/entities/ConfigService';
import { api_collection_code_v2, api_reportSKU } from 'main/request/sku';

@injectable()
export class StatisticsService implements StatisticsServiceBase {
  private _lastCursorPosition: CaretPosition = { character: -1, line: -1 };
  private _recentCompletion = new Map<string, CompletionData>();

  constructor(
    @inject(ServiceType.CONFIG)
    private _configService: ConfigService,
  ) {
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

    log.debug('StatisticsReporter.completionAccept', {
      completions: data.completions,
      position: data.position,
      projectId: data.projectId,
      timelines: {
        startGenerate: dayjs(data.timelines.startGenerate.valueOf()).format(
          'YYYY-MM-DD HH:mm:ss:SSS',
        ),
        endGenerate: dayjs(data.timelines.endGenerate.valueOf()).format(
          'YYYY-MM-DD HH:mm:ss:SSS',
        ),
        startAccept: dayjs(data.timelines.startAccept.valueOf()).format(
          'YYYY-MM-DD HH:mm:ss:SSS',
        ),
      },
      version,
    });

    this._lastCursorPosition.character = -1;
    this._lastCursorPosition.line = -1;

    const lineLength = candidate.split('\r\n').length;
    try {
      await api_reportSKU(
        constructData(
          lineLength,
          data.timelines.startAccept.toMillis(),
          DateTime.now().toMillis(),
          data.projectId,
          version,
          'CODE',
          skuNameAcceptMapping[data.completions.type],
        ),
      );
    } catch (e) {
      log.error('StatisticsReporter.completionAccept.failed', e);
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
      log.debug('StatisticsReporter.completionCancel', {
        position: data.position,
        projectId: data.projectId,
        timelines: {
          startGenerate: dayjs(data.timelines.startGenerate.valueOf()).format(
            'YYYY-MM-DD HH:mm:ss:SSS',
          ),
          endGenerate: dayjs(data.timelines.endGenerate.valueOf()).format(
            'YYYY-MM-DD HH:mm:ss:SSS',
          ),
          startAccept: dayjs(data.timelines.startAccept.valueOf()).format(
            'YYYY-MM-DD HH:mm:ss:SSS',
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

    const requestData: CollectionData = {
      createTime: data.timelines.startGenerate.toFormat('yyyy-MM-dd HH:mm:ss'),
      prefix: data.elements.prefix,
      suffix: data.elements.suffix,
      path: data.elements.file ?? '',
      similarSnippet: data.elements.similarSnippet ?? '',
      symbolList: data.elements.symbols ? [data.elements.symbols] : [],
      answer: data.completions.candidates,
      acceptAnswerIndex: data.lastChecked,
      accept: ratio === KeptRatio.None ? 0 : 1,
      afterCode: editedContent,
      plugin: 'SI',
      projectId: data.projectId,
      fileSuffix: data.elements.file
        ? extname(basename(data.elements.file))
        : '',
    };

    log.debug('StatisticsReporter.completionKept', [requestData]);

    try {
      await Promise.all([
        api_collection_code_v2([requestData]),
        ratio === KeptRatio.None
          ? undefined
          : api_reportSKU(
              constructData(
                count,
                data.timelines.startAccept.toMillis(),
                DateTime.now().toMillis(),
                data.projectId,
                version,
                'CODE',
                skuNameKeptMapping[ratio],
              ),
            ),
      ]);
    } catch (e) {
      log.error('StatisticsReporter.completionKept.failed', e);
    }
    this.completionAbort(actionId);
  }

  completionGenerated(actionId: string, completions: Completions) {
    timer.add('CompletionGenerate', 'generationEnd');
    const data = this._recentCompletion.get(actionId);
    if (!data) {
      return;
    }
    data.completions = completions;
    if (data.timelines) {
      data.timelines.endGenerate = DateTime.now();
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
      log.debug('StatisticsReporter.completionSelected', {
        completions: data.completions,
        position: data.position,
        projectId: data.projectId,
        timelines: {
          startGenerate: dayjs(data.timelines.startGenerate.valueOf()).format(
            'YYYY-MM-DD HH:mm:ss:SSS',
          ),
          endGenerate: dayjs(data.timelines.endGenerate.valueOf()).format(
            'YYYY-MM-DD HH:mm:ss:SSS',
          ),
          startAccept: dayjs(data.timelines.startAccept.valueOf()).format(
            'YYYY-MM-DD HH:mm:ss:SSS',
          ),
        },
        version,
      });
      const lineLength = candidate.split('\r\n').length;
      api_reportSKU(
        constructData(
          lineLength,
          data.timelines.startGenerate.toMillis(),
          data.timelines.endGenerate.toMillis(),
          data.projectId,
          version,
          'CODE',
          skuNameGenerateMapping[data.completions.type],
        ),
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
    log.debug('StatisticsReporter.copiedLines', {
      count,
      projectId,
      version,
    });
    try {
      await api_reportSKU(
        constructData(
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
      log.error('StatisticsReporter.copiedLines.failed', e);
    }
  }

  async incrementLines(
    count: number,
    startTime: number,
    endTime: number,
    projectId: string,
    version: string,
  ) {
    log.debug('StatisticsReporter.incrementLines', {
      count,
      startTime,
      endTime,
      projectId,
      version,
    });
    try {
      await api_reportSKU(
        constructData(count, startTime, endTime, projectId, version, 'INC', ''),
      );
    } catch (e) {
      log.error('StatisticsReporter.incrementLinesFailed', e);
    }
  }

  /**
   * @deprecated
   */
  private get _aiServiceApi() {
    const configStore = this._configService.configStore;
    return axios.create({
      baseURL: configStore.endpoints?.aiService || '',
    });
  }

  /**
   * @deprecated
   */
  private get _statisticsApi() {
    const configStore = this._configService.configStore;
    return axios.create({
      baseURL: configStore?.endpoints?.statistics || '',
    });
  }
}
