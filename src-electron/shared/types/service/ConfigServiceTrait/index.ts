import { AppConfig } from 'shared/types/service/ConfigServiceTrait/types';

export interface ConfigServiceTrait {
  getConfigs(): Promise<AppConfig>;

  getConfig<T extends keyof AppConfig>(
    key: T,
  ): Promise<AppConfig[T] | undefined>;

  setConfig<T extends keyof AppConfig>(
    key: T,
    value: AppConfig[T],
  ): Promise<void>;

  setConfigs(configs: Partial<AppConfig>): Promise<void>;

  setDarkMode(dark: boolean): Promise<void>;

  setLocale(locale: string): Promise<void>;
}
