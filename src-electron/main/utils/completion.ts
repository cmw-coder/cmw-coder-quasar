import { DataProjectType } from 'main/stores/data/types';
import packageJson from 'root/package.json';
import { ServiceType } from 'shared/types/service';
import { container } from 'main/services';
import { WebsocketService } from 'main/services/WebsocketService';
import { DataStoreService } from 'main/services/DataStoreService';

export enum CompletionErrorCause {
  accessToken = 'accessToken',
  clientInfo = 'clientInfo',
  projectData = 'projectData',
}

export const getClientVersion = (pid: number) => {
  const websocketService = container.get<WebsocketService>(
    ServiceType.WEBSOCKET,
  );
  const clientInfo = websocketService.getClientInfo(pid);
  if (!clientInfo) {
    throw new Error('Completion Generate Failed, invalid client info.', {
      cause: CompletionErrorCause.clientInfo,
    });
  }
  return `${packageJson.version}${clientInfo.version}`;
};

export const getProjectData = (project: string): DataProjectType => {
  const appData = container
    .get<DataStoreService>(ServiceType.DATA_STORE)
    .getAppdata();
  const projectData: DataProjectType | undefined = appData.project[project];
  if (!projectData || !projectData.id) {
    throw new Error('Completion Generate Failed, no valid project id.', {
      cause: CompletionErrorCause.projectData,
    });
  }
  return projectData;
};
