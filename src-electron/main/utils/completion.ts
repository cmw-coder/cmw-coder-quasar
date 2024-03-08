import { websocketManager } from 'main/components/WebsocketManager';
import { dataStore } from 'main/stores';
import { DataProjectType } from 'main/stores/data/types';
import packageJson from 'root/package.json';

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
  const projectData: DataProjectType | undefined = dataStore.project[project];
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
