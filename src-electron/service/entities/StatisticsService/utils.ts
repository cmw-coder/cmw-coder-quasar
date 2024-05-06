import { container } from 'service/index';
import { ServiceType } from 'shared/services';
import { ReportSkuDto } from 'main/request/sku';
import type { ConfigService } from 'service/entities/ConfigService';

export const constructData = (
  count: number,
  startTime: number,
  endTime: number,
  projectId: string,
  version: string,
  firstClass: string,
  skuName: string,
): ReportSkuDto[] => {
  const appConfig = container
    .get<ConfigService>(ServiceType.CONFIG)
    .getConfigsSync();
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
