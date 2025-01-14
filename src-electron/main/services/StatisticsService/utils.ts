import { DateTime } from 'luxon';

import { ReportSkuDto } from 'main/request/sku';
import { getService } from 'main/services';

import { ServiceType } from 'shared/types/service';

export const constructData = async (
  count: number,
  startTime: number,
  endTime: number,
  projectId: string,
  version: string,
  firstClass: string,
  skuName: string,
): Promise<ReportSkuDto[]> => {
  const appConfig = await getService(ServiceType.CONFIG).getStore();
  const basicData = {
    begin: Math.floor(startTime / 1000),
    end: Math.floor(endTime / 1000),
    extra: version,
    product: 'SI',
    secondClass: appConfig.activeModelKey,
    subType: projectId,
    type: 'AIGC',
    user: appConfig.username,
    userType: 'USER',
    productLine: appConfig.activeModel,
  };

  return [
    {
      ...basicData,
      count: count,
      firstClass: firstClass,
      skuName: skuName,
    },
  ];
};

export const formatTimelines = (timelines: Record<string, DateTime>) => {
  const keys = Object.keys(timelines);
  const result = {} as Record<string, string>;
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    result[key] = timelines[key].toFormat('yyyy-MM-dd HH:mm:ss:SSS');
  }
  return result;
};
