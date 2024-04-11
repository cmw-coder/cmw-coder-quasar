type SvnFileType =
  | 'added'
  | 'deleted'
  | 'modified'
  | 'replaced'
  | 'conflicted'
  | 'x'
  | 'ignored'
  | 'unversioned'
  | 'missing'
  | '~';

export interface SvnStatusItem {
  path: string;
  type: SvnFileType;
}

export type ChangedFile = {
  additions: number;
  deletions: number;
  diff: string;
} & SvnStatusItem;
