import { CompletionType, KeptRatio } from 'shared/types/common';

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
