import { Container } from 'inversify';
import 'reflect-metadata';

import { AppService } from 'service/entities/AppService';
import { ConfigService } from 'service/entities/ConfigService';
import { DataStoreService } from 'service/entities/DataStoreService';
import { StatisticsService } from 'service/entities/StatisticsService';
import { SvnService } from 'service/entities/SvnService';
import { UpdaterService } from 'service/entities/UpdaterService';
import { WebsocketService } from 'service/entities/WebsocketService';
import { WindowService } from 'service/entities/WindowService';
import { ServiceType } from 'shared/services';

const container = new Container({
  defaultScope: 'Transient',
});

container.bind<AppService>(ServiceType.App).to(AppService).inSingletonScope();
container
  .bind<ConfigService>(ServiceType.CONFIG)
  .to(ConfigService)
  .inSingletonScope();
container
  .bind<DataStoreService>(ServiceType.DATA_STORE)
  .to(DataStoreService)
  .inSingletonScope();
container
  .bind<StatisticsService>(ServiceType.STATISTICS)
  .to(StatisticsService)
  .inSingletonScope();
container.bind<SvnService>(ServiceType.SVN).to(SvnService).inSingletonScope();
container
  .bind<UpdaterService>(ServiceType.UPDATER)
  .to(UpdaterService)
  .inSingletonScope();
container
  .bind<WebsocketService>(ServiceType.WEBSOCKET)
  .to(WebsocketService)
  .inSingletonScope();
container
  .bind<WindowService>(ServiceType.WINDOW)
  .to(WindowService)
  .inSingletonScope();

export { container };
