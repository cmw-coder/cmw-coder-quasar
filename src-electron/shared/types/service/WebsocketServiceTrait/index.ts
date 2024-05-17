import { DataProjectType } from 'main/stores/data/types';

export interface WebsocketServiceTrait {
  getProjectData(): Promise<DataProjectType | undefined>;
  send(message: string, pid?: number): void;
}
