import 'reflect-metadata';
import { Container } from 'inversify';
import { ConfigService } from 'service/entities/ConfigService';
import { WindowService } from 'service/entities/WindowService';
import { SvnService } from 'service/entities/SvnService';
import { TYPES } from 'shared/service-interface/types';
import { AppService } from 'service/entities/AppService';
import { DataStoreService } from 'service/entities/DataStoreService';
import { UpdaterService } from 'service/entities/UpdaterService';
import { StatisticsReporterService } from 'service/entities/StatisticsReporterService';
import { WebsocketService } from 'service/entities/WebsocketService';

const container = new Container({
  defaultScope: 'Transient',
});

container
  .bind<ConfigService>(TYPES.ConfigService)
  .to(ConfigService)
  .inSingletonScope();
container
  .bind<WindowService>(TYPES.WindowService)
  .to(WindowService)
  .inSingletonScope();
container.bind<SvnService>(TYPES.SvnService).to(SvnService).inSingletonScope();
container.bind<AppService>(TYPES.AppService).to(AppService).inSingletonScope();
container
  .bind<DataStoreService>(TYPES.DataStoreService)
  .to(DataStoreService)
  .inSingletonScope();
container
  .bind<UpdaterService>(TYPES.UpdaterService)
  .to(UpdaterService)
  .inSingletonScope();
container
  .bind<StatisticsReporterService>(TYPES.StatisticsReporterService)
  .to(StatisticsReporterService)
  .inSingletonScope();

container
  .bind<WebsocketService>(TYPES.WebsocketService)
  .to(WebsocketService)
  .inSingletonScope();

export { container };
