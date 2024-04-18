import { container } from 'service';
import type { AppService } from 'service/entities/AppService';
import type { UpdaterService } from 'service/entities/UpdaterService';
import { ServiceType } from 'shared/services';

const appService = container.get<AppService>(ServiceType.App);
const updaterService = container.get<UpdaterService>(ServiceType.UPDATER);

appService.init();
updaterService.init();
