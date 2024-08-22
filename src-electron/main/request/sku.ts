import statisticsLog from 'main/components/Loggers/statisticsLog';
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

export const api_reportSKU = async (data: ReportSkuDto[]) => {
  try {
    const logData = data.map(
      (item) =>
        `SKU 上报: ${item.extra} ${item.subType} ${item.type}.${item.product}.${item.firstClass}.${item.secondClass}.${item.skuName} [${item.count}]`,
    );
    statisticsLog.debug(logData.join('\n'));
    await request({
      url: '/kong/RdTestResourceStatistic/report/summary',
      method: 'post',
      data: data,
    });
  } catch (e) {
    statisticsLog.error('StatisticsReporter Failed', data, e);
  }
};

export const api_collection_code_v2 = async (data: CollectionData[]) =>
  request({
    url: '/kong/RdTestAiService/chatgpt/collection/v2',
    method: 'post',
    data,
  });
