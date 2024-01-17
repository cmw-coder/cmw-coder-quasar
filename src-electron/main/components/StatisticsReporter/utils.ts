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
  const isSnippet = completion[0] === '1';
  const lines = isSnippet ? completion.substring(1).split('\\r\\n').length : 1;
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
      count: lines,
      firstClass: 'CODE',
      skuName: isSnippet
        ? isAccept
          ? 'KEEP_MULTI'
          : 'GENE_MULTI'
        : isAccept
        ? 'KEEP'
        : 'GENE',
    },
  ];
};
