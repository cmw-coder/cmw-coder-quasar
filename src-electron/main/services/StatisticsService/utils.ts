import { ReportSkuDto } from 'main/request/sku';
import { getService } from 'main/services';
import { ServiceType } from 'shared/types/service';

export const constructData = (
  count: number,
  startTime: number,
  endTime: number,
  projectId: string,
  version: string,
  firstClass: string,
  skuName: string,
): ReportSkuDto[] => {
  const appConfig = getService(ServiceType.CONFIG).getConfigs();
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
