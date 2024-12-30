import { SimilarSnippet } from 'shared/types/common';
import { ProjectData } from 'shared/types/service/DataServiceTrait/types';
import { ClientInfo } from 'main/services/WebsocketService/types';

export interface WebsocketServiceTrait {
  getCurrentFile(): Promise<string | undefined>;

  getLastActivateProjectData(): Promise<ProjectData | undefined>;

  getSimilarSnippets(
    character: number,
    folder: string,
    line: number,
    path: string,
    prefix: string,
    suffix: string,
  ): Promise<SimilarSnippet[]>;

  getClientInfo(pid?: number): ClientInfo | undefined;

  send(message: string, pid?: number): void;
}
