export interface WindowServiceBase {
  finishStartSetting(): Promise<void>;
  finishLogin(): Promise<void>;
}
