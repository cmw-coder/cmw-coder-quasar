import { HuggingFaceModelType, LinseerModelType } from 'shared/types/model';
import { CompletionType } from 'shared/types/common';
import { KeptRatio } from 'main/services/StatisticsService/types';

export const secondClassMap: Record<
  HuggingFaceModelType | LinseerModelType,
  string
> = {
  [HuggingFaceModelType.ComwareV1]: 'CMW',
  [HuggingFaceModelType.ComwareV2]: 'CODELLAMA',
  [LinseerModelType.Linseer]: 'LS13B',
  [LinseerModelType.Linseer_SR88Driver]: 'LS13B',
  [LinseerModelType.Linseer_CClsw]: 'LS13B',
  [LinseerModelType.Linseer_Beta]: 'CMW_BETA_V1',
};

export const productLineMapping: Record<LinseerModelType, string> = {
  [LinseerModelType.Linseer]: 'H3C 通用',
  [LinseerModelType.Linseer_Beta]: 'ComWare产品线',
  [LinseerModelType.Linseer_CClsw]: '交换机产品线',
  [LinseerModelType.Linseer_SR88Driver]: '路由器产品线',
};

export const skuNameAcceptMapping: Record<CompletionType, string> = {
  [CompletionType.Function]: 'KEEP_MULTI',
  [CompletionType.Line]: 'KEEP_INLINE',
  [CompletionType.Snippet]: 'KEEP',
};

export const skuNameGenerateMapping: Record<CompletionType, string> = {
  [CompletionType.Function]: 'GENE_MULTI',
  [CompletionType.Line]: 'GENE_INLINE',
  [CompletionType.Snippet]: 'GENE',
};

export const skuNameKeptMapping: Record<
  Exclude<KeptRatio, KeptRatio.None>,
  string
> = {
  [KeptRatio.All]: 'ADOPT',
  [KeptRatio.Few]: 'ADOPT_50',
  [KeptRatio.Most]: 'ADOPT_80',
};
