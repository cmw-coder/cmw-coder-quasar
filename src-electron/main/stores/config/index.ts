import log from 'electron-log/main';
import ElectronStore from 'electron-store';

import { linseerConfigDefault } from 'main/stores/config/default';
import { LinseerDataType, LinseerStoreType } from 'main/stores/config/types';

export class LinseerConfigStore {
  private _store: ElectronStore<LinseerStoreType>;

  constructor() {
    this._store = new ElectronStore({
      clearInvalidConfig: true,
      defaults: linseerConfigDefault,
      migrations: {
        '1.2.0': (store) => {
          log.info('Upgrading "config" store to 1.2.0 ...');
          const oldData = store.get('data');
          if (oldData?.tokens?.access && oldData?.tokens?.refresh) {
            store.set('data.tokens', oldData.tokens);
          }
        },
      },
      name: 'config',
    });
  }

  get data(): LinseerDataType {
    return this._store.get('data');
  }
}
