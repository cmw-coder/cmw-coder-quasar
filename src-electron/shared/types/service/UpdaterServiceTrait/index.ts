export interface UpdaterServiceTrait {
  init(): Promise<void>;
  checkUpdate(): Promise<void>;
}
