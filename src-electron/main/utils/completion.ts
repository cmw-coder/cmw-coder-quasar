import { websocketManager } from 'main/components/WebsocketManager';
import { DataProjectType } from 'main/stores/data/types';
import packageJson from 'root/package.json';
import { DataStoreService } from 'service/entities/DataStoreService';
import { container } from 'service/inversify.config';
import { TYPES } from 'shared/service-interface/types';

export enum CompletionErrorCause {
  accessToken = 'accessToken',
  clientInfo = 'clientInfo',
  projectData = 'projectData',
}

export const getClientVersion = (pid: number) => {
  const clientInfo = websocketManager.getClientInfo(pid);
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
