import { AppServiceBase } from './AppServiceBase';
import { ConfigServiceBase } from './ConfigServiceBase';
import { SvnServiceBase } from './SvnServiceBase';
import { WindowServiceBase } from './WindowServiceInterface';

enum TYPES {
  ConfigService = 'ConfigService',
  WindowService = 'WindowService',
  SvnService = 'SvnService',
  AppService = 'AppService',
}

const ServiceCallKey = 'Service:Call';

type Service<T extends TYPES> = T extends TYPES.ConfigService
  ? ConfigServiceBase
  : T extends TYPES.WindowService
    ? WindowServiceBase
    : T extends TYPES.SvnService
      ? SvnServiceBase
      : T extends TYPES.AppService
        ? AppServiceBase
        : never;

export { TYPES, ServiceCallKey, type Service };
