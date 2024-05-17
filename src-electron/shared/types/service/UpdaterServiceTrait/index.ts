export interface UpdaterServiceTrait {
  init(): void;
  checkUpdate(): Promise<void>;
}
