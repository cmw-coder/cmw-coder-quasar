import { AppData } from 'shared/types/AppData';

export interface DataStoreServiceBase {
  getAppDataAsync(): Promise<AppData>;
}
