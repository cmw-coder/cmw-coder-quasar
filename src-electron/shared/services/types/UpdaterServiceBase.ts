export interface UpdaterServiceBase {
  checkUpdate(): Promise<void>;
}
