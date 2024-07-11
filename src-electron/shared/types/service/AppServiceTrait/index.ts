export interface AppServiceTrait {
  init(): void;
  locateFileInFolder(filePath: string): Promise<void>;
}
