import { DataStoreServiceBase } from 'shared/service-interface/DataStoreServiceBase';
import { AppServiceBase } from 'shared/service-interface/AppServiceBase';
import { ConfigServiceBase } from 'shared/service-interface/ConfigServiceBase';
import { SvnServiceBase } from 'shared/service-interface/SvnServiceBase';
import { WindowServiceBase } from 'shared/service-interface/WindowServiceInterBase';
import { UpdaterServiceBase } from 'shared/service-interface/UpdaterServiceBase';
import { StatisticsReporterServiceBase } from 'shared/service-interface/StatisticsReporterServiceBase';
import { WebsocketServiceBase } from 'shared/service-interface/WebsocketServiceBase';

enum TYPES {
  ConfigService = 'ConfigService',
  WindowService = 'WindowService',
  SvnService = 'SvnService',
  AppService = 'AppService',
  DataStoreService = 'DataStoreService',
  UpdaterService = 'UpdaterService',
  StatisticsReporterService = 'StatisticsReporterService',
  WebsocketService = 'WebsocketService',
}

const ServiceCallKey = 'Service:Call';

interface ServiceTypeMapping {
  [TYPES.ConfigService]: ConfigServiceBase;
  [TYPES.WindowService]: WindowServiceBase;
  [TYPES.SvnService]: SvnServiceBase;
  [TYPES.AppService]: AppServiceBase;
  [TYPES.DataStoreService]: DataStoreServiceBase;
  [TYPES.UpdaterService]: UpdaterServiceBase;
  [TYPES.StatisticsReporterService]: StatisticsReporterServiceBase;
  [TYPES.WebsocketService]: WebsocketServiceBase;
}

type Service<T extends TYPES> = ServiceTypeMapping[T];

export { TYPES, ServiceCallKey, type Service };
