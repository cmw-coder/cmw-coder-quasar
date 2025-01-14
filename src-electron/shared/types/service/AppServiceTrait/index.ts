export interface AppServiceTrait {
  init(): void;

  updateBackupIntervalSeconds(intervalSeconds: number): Promise<void>;
}
