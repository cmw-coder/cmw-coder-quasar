export interface UtilsServiceTrait {
  checkFolderExist(path: string): Promise<boolean>;

  getFileContent(path: string): Promise<string | undefined>;
}
