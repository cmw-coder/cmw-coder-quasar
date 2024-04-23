import {
  productLineMapping,
  secondClassMap,
} from 'service/entities/StatisticsService/constants';
import { container } from 'service/index';
import type { ConfigService } from 'service/entities/ConfigService';
import { ServiceType } from 'shared/services';
import { HuggingFaceModelType, LinseerModelType } from 'shared/types/model';

export const constructData = (
  count: number,
  startTime: number,
  endTime: number,
  projectId: string,
  version: string,
  modelType: HuggingFaceModelType | LinseerModelType,
  firstClass: string,
  skuName: string,
) => {
  const configService = container.get<ConfigService>(ServiceType.CONFIG);
  const basicData = {
    begin: Math.floor(startTime / 1000),
    end: Math.floor(endTime / 1000),
    extra: version,
    product: 'SI',
    secondClass: secondClassMap[modelType],
    subType: projectId,
    type: 'AIGC',
    user: configService.configStore.config.userId,
    userType: 'USER',
    productLine:
      modelType in LinseerModelType
        ? productLineMapping[modelType as LinseerModelType]
        : '',
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
