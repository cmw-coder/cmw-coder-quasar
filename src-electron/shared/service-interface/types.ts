import { I_AppService } from './I_AppService';
import { I_ConfigService } from './I_ConfigService';
import { I_SvnService } from './I_SvnService';
import { I_WindowService } from './I_WindowService';

enum TYPES {
  ConfigService = 'ConfigService',
  WindowService = 'WindowService',
  SvnService = 'SvnService',
  AppService = 'AppService',
}

const ServiceCallKey = 'Service:Call';

type Service<T extends TYPES> = T extends TYPES.ConfigService
  ? I_ConfigService
  : T extends TYPES.WindowService
    ? I_WindowService
    : T extends TYPES.SvnService
      ? I_SvnService
      : T extends TYPES.AppService
        ? I_AppService
        : never;

export { TYPES, ServiceCallKey, type Service };
