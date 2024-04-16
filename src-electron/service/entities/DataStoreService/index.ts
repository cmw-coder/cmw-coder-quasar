import { injectable } from 'inversify';
import { DataStoreServiceBase } from 'shared/service-interface/DataStoreServiceBase';
import { DataStore } from 'main/stores/data';
import { DataStoreType } from 'main/stores/data/types';
import { registerAction } from 'preload/types/ActionApi';
import { ActionType } from 'shared/types/ActionMessage';

@injectable()
export class DataStoreService implements DataStoreServiceBase {
  dataStore = new DataStore();

  constructor() {
    registerAction(
      ActionType.DataStoreSave,
      `main.stores.${ActionType.DataStoreSave}`,
      (data) => {
        this.dataStore.store = data;
      },
    );
  }

  async save(data: Partial<DataStoreType>) {
    this.dataStore.store = data;
  }
}
