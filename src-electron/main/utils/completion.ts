import { DataProjectType } from 'main/stores/data/types';
import packageJson from 'root/package.json';
import type { DataStoreService } from 'service/entities/DataStoreService';
import type { WebsocketService } from 'service/entities/WebsocketService';
import { container } from 'service/inversify.config';
import { TYPES } from 'shared/service-interface/types';

export enum CompletionErrorCause {
  accessToken = 'accessToken',
  clientInfo = 'clientInfo',
  projectData = 'projectData',
}

export const getClientVersion = (pid: number) => {
  const websocketService = container.get<WebsocketService>(
    TYPES.WebsocketService,
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
  const dataStore = container.get<DataStoreService>(
    TYPES.DataStoreService,
  ).dataStore;
  const projectData: DataProjectType | undefined =
    dataStore.store.project[project];
  if (!projectData) {
    throw new Error('Completion Generate Failed, no valid project id.', {
      cause: CompletionErrorCause.projectData,
    });
  }
  if (!projectData.svn.length) {
    dataStore.setProjectRevision(project).catch();
  }
  return projectData;
};
