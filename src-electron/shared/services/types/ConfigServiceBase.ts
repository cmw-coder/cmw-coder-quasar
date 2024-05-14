import { AppConfig } from 'shared/types/AppConfig';

export interface ConfigServiceBase {
  getConfigs(): Promise<AppConfig>;
  getConfig<T extends keyof AppConfig>(key: T): Promise<AppConfig[T]>;
  setConfig<T extends keyof AppConfig>(
    key: T,
    value: AppConfig[T],
  ): Promise<void>;
  setConfigs(configs: Partial<AppConfig>): Promise<void>;
}
