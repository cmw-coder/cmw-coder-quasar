export type SvnFileType =
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

export interface SvnStatus {
  path: string;
  type: SvnFileType;
}

export type ChangedFile = {
  additions: number;
  deletions: number;
  diff: string;
} & SvnStatus;
