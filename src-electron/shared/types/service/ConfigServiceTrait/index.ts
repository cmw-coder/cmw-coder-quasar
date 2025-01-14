import { AppConfig } from 'shared/types/service/ConfigServiceTrait/types';

export interface ConfigServiceTrait {
  get<Key extends keyof AppConfig>(key: Key): Promise<AppConfig[Key]>;

  get<Key extends keyof AppConfig>(
    key: Key,
    defaultValue: Required<AppConfig>[Key],
  ): Promise<Required<AppConfig>[Key]>;

  get<Key extends string, Value = unknown>(
    key: Exclude<Key, keyof AppConfig>,
    defaultValue?: Value,
  ): Promise<Value>;

  getStore(): Promise<AppConfig>;

  set<Key extends keyof AppConfig>(
    key: Key,
    value?: AppConfig[Key],
  ): Promise<void>;

  set(key: string, value: unknown): Promise<void>;

  set(object: Partial<AppConfig>): Promise<void>;

  setConfigs(configs: Partial<AppConfig>): Promise<void>;

  setDarkMode(dark: boolean): Promise<void>;

  setLocale(locale: string): Promise<void>;
}
