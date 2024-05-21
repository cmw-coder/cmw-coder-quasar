import { getService } from 'main/services';
import { ServiceType } from 'shared/types/service';

const appService = getService(ServiceType.App);
const updaterService = getService(ServiceType.UPDATER);

appService.init();
updaterService.init().catch();
