export type SvnStatus =
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

export interface FileStatus {
  path: string;
  status: SvnStatus;
}

export type FileChanges = FileStatus & {
  additions: number;
  deletions: number;
  diff: string;
};
