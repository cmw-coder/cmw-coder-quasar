import { injectable } from 'inversify';
import { DataStoreServiceBase } from 'shared/service-interface/DataStoreServiceBase';
import { DataStore } from 'main/stores/data';
import { DataStoreType } from 'main/stores/data/types';

@injectable()
export class DataStoreService implements DataStoreServiceBase {
  dataStore = new DataStore();

  async save(data: Partial<DataStoreType>) {
    this.dataStore.store = data;
  }
}
