import { SvnFileType } from 'shared/types/svn';

export interface RepoStatusData {
  status: {
    target: {
      entry:
        | {
            _attribute: { path: string };
            ['wc-status']: { _attribute: { item: SvnFileType } };
          }
        | {
            _attribute: { path: string };
            ['wc-status']: { _attribute: { item: SvnFileType } };
          }[];
    };
  };
}
