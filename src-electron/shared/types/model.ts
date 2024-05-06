/**
 * @deprecated
 */
export enum ApiStyle {
  HuggingFace = 'HuggingFace',
  Linseer = 'Linseer',
}

/**
 * @deprecated
 */
export enum HuggingFaceModelType {
  ComwareV1 = 'ComwareV1',
  ComwareV2 = 'ComwareV2',
}

/**
 * @deprecated
 */
export enum LinseerModelType {
  Linseer = 'Linseer',
  Linseer_Beta = 'Linseer_Beta',
  Linseer_CClsw = 'Linseer_CClsw',
  Linseer_SR88Driver = 'Linseer_SR88Driver',
}

/**
 * @deprecated
 */
export enum SubModelType {
  'linseer-code-single-line' = 'linseer-code-single-line',
  'linseer-code-13b-cclsw' = 'linseer-code-13b-cclsw',
  'linseer-code-13b-sr88drv' = 'linseer-code-13b-sr88drv',
  'linseer-code-multi-line' = 'linseer-code-multi-line',
  'CmwCoder' = 'CmwCoder',
  'CmwCoderV1' = 'CmwCoderV1',
}
