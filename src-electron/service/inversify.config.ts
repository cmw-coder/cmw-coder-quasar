import 'reflect-metadata';
import { Container } from 'inversify';
import { ConfigService } from 'service/entities/ConfigService';
import { WindowService } from 'service/entities/WindowService';
import { SvnService } from 'service/entities/SvnService';
import { TYPES } from 'service/types';
import { InvokeService } from 'service/entities/InvokeService';

const container = new Container({
  defaultScope: 'Transient',
});

container.bind<ConfigService>(TYPES.ConfigService).to(ConfigService);
container.bind<WindowService>(TYPES.WindowService).to(WindowService);
container.bind<InvokeService>(TYPES.InvokeService).to(InvokeService);
container.bind<SvnService>(TYPES.SvnService).to(SvnService);

export { container };
