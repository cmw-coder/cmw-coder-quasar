import { Container } from 'inversify';
import { ConfigService } from 'service/entities/ConfigService';
import { TYPES } from 'service/types';
import { WindowService } from 'service/entities/WindowService';
import { InvokeService } from './entities/InvokeService';

const container = new Container();

container.bind<ConfigService>(TYPES.ConfigService).to(ConfigService);
container.bind<WindowService>(TYPES.WindowService).to(WindowService);
container.bind<InvokeService>(TYPES.InvokeService).to(InvokeService);

export { container };
