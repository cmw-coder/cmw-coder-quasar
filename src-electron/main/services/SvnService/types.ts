import { SvnStatus } from 'shared/types/service/SvnServiceTrait/types';

export interface RepoStatusData {
  status: {
    target: {
      entry:
        | {
            _attribute: { path: string };
            ['wc-status']: { _attribute: { item: SvnStatus } };
          }
        | {
            _attribute: { path: string };
            ['wc-status']: { _attribute: { item: SvnStatus } };
          }[];
    };
  };
}
