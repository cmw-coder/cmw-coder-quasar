import { AppServiceTrait } from 'shared/types/service/AppServiceTrait';
import { ConfigServiceTrait } from 'shared/types/service/ConfigServiceTrait';
import { DataStoreServiceTrait } from 'shared/types/service/DataStoreServiceTrait';
import { StatisticsServiceTrait } from 'shared/types/service/StatisticsServiceTrait';
import { SvnServiceTrait } from 'shared/types/service/SvnServiceTrait';
import { UpdaterServiceTrait } from 'shared/types/service/UpdaterServiceTrait';
import { UtilsServiceTrait } from 'shared/types/service/UtilsServiceTrait';
import { WebsocketServiceTrait } from 'shared/types/service/WebsocketServiceTrait';
import { WindowServiceTrait } from 'shared/types/service/WindowServiceTrait';

export const SERVICE_CALL_KEY = 'Service:Call' as const;

export enum ServiceType {
  App = 'App',
  CONFIG = 'CONFIG',
  DATA_STORE = 'DATA_STORE',
  STATISTICS = 'STATISTICS',
  SVN = 'SVN',
  UPDATER = 'UPDATER',
  UTILS = 'UTILS',
  WEBSOCKET = 'WEBSOCKET',
  WINDOW = 'WINDOW',
}

export interface ServiceTypeMapping {
  [ServiceType.App]: AppServiceTrait;
  [ServiceType.CONFIG]: ConfigServiceTrait;
  [ServiceType.DATA_STORE]: DataStoreServiceTrait;
  [ServiceType.STATISTICS]: StatisticsServiceTrait;
  [ServiceType.SVN]: SvnServiceTrait;
  [ServiceType.UTILS]: UtilsServiceTrait;
  [ServiceType.UPDATER]: UpdaterServiceTrait;
  [ServiceType.WEBSOCKET]: WebsocketServiceTrait;
  [ServiceType.WINDOW]: WindowServiceTrait;
}

export type Service<T extends ServiceType> = ServiceTypeMapping[T];
