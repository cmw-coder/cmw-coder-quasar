import { DataProjectType } from 'shared/types/AppData';

export interface WebsocketServiceBase {
  getProjectData(): Promise<DataProjectType | undefined>;
  send(message: string, pid?: number): void;
}
