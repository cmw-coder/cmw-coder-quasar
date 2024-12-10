export interface AppServiceTrait {
  init(): void;

  updateBackupIntervalMinutes(intervalMinutes: number): Promise<void>;
}
