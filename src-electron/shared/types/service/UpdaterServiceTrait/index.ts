export interface UpdaterServiceTrait {
  init(): Promise<void>;
  checkUpdate(): Promise<void>;
  getUpdateData(): Promise<{
    currentVersion: string;
    newVersion: string;
    releaseDate: string;
  }>;
}
