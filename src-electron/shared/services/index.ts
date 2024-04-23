import { AppServiceBase } from 'shared/services/types/AppServiceBase';
import { ConfigServiceBase } from 'shared/services/types/ConfigServiceBase';
import { DataStoreServiceBase } from 'shared/services/types/DataStoreServiceBase';
import { StatisticsServiceBase } from 'shared/services/types/StatisticsServiceBase';
import { SvnServiceBase } from 'shared/services/types/SvnServiceBase';
import { UpdaterServiceBase } from 'shared/services/types/UpdaterServiceBase';
import { WebsocketServiceBase } from 'shared/services/types/WebsocketServiceBase';
import { WindowServiceBase } from 'shared/services/types/WindowServiceInterBase';

export const SERVICE_CALL_KEY = 'Service:Call' as const;

export enum ServiceType {
  App = 'App',
  CONFIG = 'CONFIG',
  DATA_STORE = 'DATA_STORE',
  STATISTICS = 'STATISTICS',
  SVN = 'SVN',
  UPDATER = 'UPDATER',
  WEBSOCKET = 'WEBSOCKET',
  WINDOW = 'WINDOW',
}

export interface ServiceTypeMapping {
  [ServiceType.App]: AppServiceBase;
  [ServiceType.CONFIG]: ConfigServiceBase;
  [ServiceType.DATA_STORE]: DataStoreServiceBase;
  [ServiceType.STATISTICS]: StatisticsServiceBase;
  [ServiceType.SVN]: SvnServiceBase;
  [ServiceType.UPDATER]: UpdaterServiceBase;
  [ServiceType.WEBSOCKET]: WebsocketServiceBase;
  [ServiceType.WINDOW]: WindowServiceBase;
}

export type Service<T extends ServiceType> = ServiceTypeMapping[T];
