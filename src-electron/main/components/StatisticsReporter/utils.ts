import {
  productLineMapping,
  secondClassMap,
} from 'main/components/StatisticsReporter/constants';
import type { ConfigService } from 'service/entities/ConfigService';
import { container } from 'service/inversify.config';
import { TYPES } from 'shared/service-interface/types';
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
  const configService = container.get<ConfigService>(TYPES.ConfigService);
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
