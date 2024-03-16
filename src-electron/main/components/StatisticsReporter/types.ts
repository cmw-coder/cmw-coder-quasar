export interface CollectionData {
  createTime: string;
  prefix: string;
  suffix: string;
  path: string;
  similarSnippet: string;
  symbolList: string[];
  answer: string[];
  acceptAnswerIndex: number;
  accept: 0 | 1;
  afterCode: string;
  plugin: 'SI';
  projectId: string;
  fileSuffix: string;
}

export enum KeptRatio {
  All = 'All',
  Most = 'Most',
  Few = 'Few',
}
