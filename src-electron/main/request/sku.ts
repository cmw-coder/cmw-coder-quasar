import { userInfo } from 'os';
import request from 'main/request';
import { CollectionData } from 'service/entities/StatisticsService/types';
import log from 'electron-log/main';
import { DateTime } from 'luxon';

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

export const api_reportSKU = async (data: ReportSkuDto[]) => {
  try {
    const handledData = data.map((item) => ({
      ...item,
      begin: item.begin
        ? item.begin
        : Math.trunc(DateTime.now().valueOf() / 1000),
      end: item.end ? item.end : Math.trunc(DateTime.now().valueOf() / 1000),
      hostName: userInfo().username,
      extra: '',
    }));
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