import 'reflect-metadata';
import { Container } from 'inversify';
import { ConfigService } from 'service/entities/ConfigService';
import { WindowService } from 'service/entities/WindowService';
import { SvnService } from 'service/entities/SvnService';
import { TYPES } from 'shared/service-interface/types';
import { AppService } from 'service/entities/AppService';

const container = new Container({
  defaultScope: 'Transient',
});

container.bind<ConfigService>(TYPES.ConfigService).to(ConfigService);
container.bind<WindowService>(TYPES.WindowService).to(WindowService);
container.bind<SvnService>(TYPES.SvnService).to(SvnService);
container.bind<AppService>(TYPES.AppService).to(AppService);

export { container };
