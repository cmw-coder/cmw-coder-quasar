import { Container } from 'inversify';
import 'reflect-metadata';

import { AppService } from 'main/services/AppService';
import { ConfigService } from 'main/services/ConfigService';
import { DataService } from 'main/services/DataService';
import { StatisticsService } from 'main/services/StatisticsService';
import { SvnService } from 'main/services/SvnService';
import { UpdaterService } from 'main/services/UpdaterService';
import { UtilsService } from 'main/services/UtilsService';
import { WebsocketService } from 'main/services/WebsocketService';
import { WindowService } from 'main/services/WindowService';
import { ServiceType, ServiceTypeMapping } from 'shared/types/service';

export const container = new Container({
  defaultScope: 'Singleton',
});

container.bind(ServiceType.App).to(AppService);
container.bind(ServiceType.CONFIG).to(ConfigService);
container.bind(ServiceType.DATA).to(DataService);
container.bind(ServiceType.STATISTICS).to(StatisticsService);
container.bind(ServiceType.SVN).to(SvnService);
container.bind(ServiceType.UPDATER).to(UpdaterService);
container.bind(ServiceType.UTILS).to(UtilsService);
container.bind(ServiceType.WEBSOCKET).to(WebsocketService);
container.bind(ServiceType.WINDOW).to(WindowService);

export const getService = <T extends ServiceType>(
  serviceType: T,
): ServiceTypeMapping[T] => {
  return container.get<ServiceTypeMapping[T]>(serviceType);
};
