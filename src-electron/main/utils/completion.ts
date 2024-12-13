import { container } from 'main/services';
import { DataStoreService } from 'main/services/DataStoreService';
import { WebsocketService } from 'main/services/WebsocketService';
import { DataProjectType } from 'main/stores/data/types';
import packageJson from 'root/package.json';
import { FONT_SIZE_MAPPING } from 'shared/constants/common';
import { ServiceType } from 'shared/types/service';

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

export const getFontSize = (fontHeight: number) => {
  return FONT_SIZE_MAPPING[fontHeight]
    ? FONT_SIZE_MAPPING[fontHeight] * fontHeight
    : -0.000000000506374957617199 * fontHeight ** 6 +
        0.000000123078838391882 * fontHeight ** 5 -
        0.0000118441038684185 * fontHeight ** 4 +
        0.000574698566099494 * fontHeight ** 3 -
        0.0147437317361461 * fontHeight ** 2 +
        1.09720488138051 * fontHeight;
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
