import { AppConfig } from 'shared/types/service/ConfigServiceTrait/types';

export interface ConfigServiceTrait {
  getConfigs(): AppConfig;

  getConfig<T extends keyof AppConfig>(key: T): Promise<AppConfig[T]>;

  setConfig<T extends keyof AppConfig>(
    key: T,
    value: AppConfig[T],
  ): Promise<void>;

  setConfigs(configs: Partial<AppConfig>): Promise<void>;
}
