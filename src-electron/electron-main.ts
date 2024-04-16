import { container } from 'service/inversify.config';
import { TYPES } from 'shared/service-interface/types';
import type { AppService } from 'service/entities/AppService';
import type { UpdaterService } from 'service/entities/UpdaterService';

const appService = container.get<AppService>(TYPES.AppService);
const updaterService = container.get<UpdaterService>(TYPES.UpdaterService);

appService.init();
updaterService.init();
