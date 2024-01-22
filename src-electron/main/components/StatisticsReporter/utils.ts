import {
  productLineMap,
  secondClassMap,
} from 'main/components/StatisticsReporter/constants';
import { configStore } from 'main/stores';
import { HuggingFaceModelType, LinseerModelType } from 'main/types/model';

export const constructData = (
  completion: string,
  startTime: number,
  endTime: number,
  projectId: string,
  version: string,
  modelType: HuggingFaceModelType | LinseerModelType,
  isAccept: boolean
) => {
  const lineCount = completion.split('\r\n').length;
  const basicData = {
    begin: Math.floor(startTime / 1000),
    end: Math.floor(endTime / 1000),
    extra: version,
    product: 'SI',
    secondClass: secondClassMap.get(modelType),
    subType: projectId,
    type: 'AIGC',
    user: configStore.config.userId,
    userType: 'USER',
    productLine:
      modelType in LinseerModelType
        ? productLineMap.get(modelType as LinseerModelType)
        : '',
  };

  return [
    {
      ...basicData,
      count: lineCount,
      firstClass: 'CODE',
      skuName: lineCount > 1
        ? isAccept
          ? 'KEEP_MULTI'
          : 'GENE_MULTI'
        : isAccept
        ? 'KEEP'
        : 'GENE',
    },
  ];
};
