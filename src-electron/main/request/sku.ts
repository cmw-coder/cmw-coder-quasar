import log from 'electron-log/main';
import { DateTime } from 'luxon';

import request from 'main/request';
import { CollectionData } from 'main/services/StatisticsService/types';

export interface ReportSkuDto {
  begin?: number;
  end?: number;
  count: number;
  type: string;
  product: string;
  firstClass: string;
  secondClass: string;
  skuName: string;
  user: string;
  userType: string; // 'USER' | 'HOST'
  extra?: string;
  subType?: string;
  hostName?: string;
}

export const api_reportSKU = async (data: ReportSkuDto[], username: string) => {
  try {
    const handledData = data.map((item) => ({
      ...item,
      begin: item.begin
        ? item.begin
        : Math.trunc(DateTime.now().valueOf() / 1000),
      end: item.end ? item.end : Math.trunc(DateTime.now().valueOf() / 1000),
      hostName: username,
    }));
    const logData = handledData.map(
      (item) =>
        `SKU 上报: ${item.extra} ${item.subType} ${item.type}.${item.product}.${item.firstClass}.${item.secondClass}.${item.skuName} [${item.count}]`,
    );
    log.debug(logData.join('\n'));
    await request({
      url: '/kong/RdTestResourceStatistic/report/summary',
      method: 'post',
      data: handledData,
    });
  } catch (e) {
    log.error('StatisticsReporter Failed', data, e);
  }
};

export const api_collection_code_v2 = async (data: CollectionData[]) =>
  request({
    url: '/kong/RdTestAiService/chatgpt/collection/v2',
    method: 'post',
    data,
  });
