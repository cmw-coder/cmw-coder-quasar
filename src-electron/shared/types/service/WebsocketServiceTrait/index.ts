import { DataProjectType } from 'main/stores/data/types';
import { SimilarSnippet } from 'shared/types/common';

export interface WebsocketServiceTrait {
  checkFolderExist(path: string): Promise<boolean>;

  getFileContent(path: string): Promise<string | undefined>;

  getProjectData(): Promise<DataProjectType | undefined>;

  getSimilarSnippets(
    character: number,
    folder: string,
    line: number,
    path: string,
    prefix: string,
    suffix: string,
  ): Promise<SimilarSnippet[]>;

  send(message: string, pid?: number): void;
}
