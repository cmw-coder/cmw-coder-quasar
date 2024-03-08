import { HuggingFaceModelType, LinseerModelType } from 'shared/types/model';

export const secondClassMap = new Map<
  HuggingFaceModelType | LinseerModelType,
  string
>([
  [HuggingFaceModelType.ComwareV1, 'CMW'],
  [HuggingFaceModelType.ComwareV2, 'CODELLAMA'],
  [LinseerModelType.Linseer, 'LS13B'],
  [LinseerModelType.Linseer_SR88Driver, 'LS13B'],
  [LinseerModelType.Linseer_CClsw, 'LS13B'],
]);

export const productLineMap = new Map<LinseerModelType, string>([
  [LinseerModelType.Linseer, 'H3C 通用'],
  [LinseerModelType.Linseer_CClsw, '交换机产品线'],
  [LinseerModelType.Linseer_SR88Driver, ''], //高端路由模型还未推出，产品线字段暂时返回空，后续更新删除该注释
]);
