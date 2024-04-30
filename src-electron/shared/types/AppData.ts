import { WindowType } from 'shared/types/WindowType';

export interface DataCompatibilityType {
  transparentFallback: boolean;
  zoomFix: boolean;
}

export interface DataProjectType {
  id: string;
  lastAddedLines: number;
  svn: {
    directory: string;
    revision: number;
  }[];
}

export interface WindowData {
  x?: number;
  y?: number;
  height?: number;
  width?: number;
  show: boolean;
}

export type DataWindowType = Record<WindowType, WindowData>;

export interface AppData {
  compatibility: DataCompatibilityType;
  project: Record<string, DataProjectType>;
  window: DataWindowType;
}

export const defaultAppData: AppData = {
  compatibility: {
    transparentFallback: false,
    zoomFix: false,
  },
  project: {},
  window: {
    [WindowType.Chat]: {
      height: 1300,
      width: 780,
      show: false,
    },
    [WindowType.Commit]: {
      height: 1300,
      width: 780,
      show: false,
    },
    [WindowType.Completions]: {
      height: 0,
      width: 0,
      show: false,
    },
    [WindowType.Login]: {
      height: 600,
      width: 800,
      show: false,
    },
    [WindowType.Main]: {
      height: 1300,
      width: 780,
      show: false,
    },
    [WindowType.Quake]: {
      height: 600,
      width: 800,
      show: false,
    },
    [WindowType.Setting]: {
      height: 600,
      width: 800,
      show: false,
    },
    [WindowType.StartSetting]: {
      height: 600,
      width: 800,
      show: false,
    },
    [WindowType.WorkFlow]: {
      height: 1300,
      width: 780,
      show: false,
    },
    [WindowType.ProjectId]: {
      height: 600,
      width: 800,
      show: false,
    },
    [WindowType.Floating]: {
      height: 600,
      width: 800,
      show: false,
    },
    [WindowType.Immersive]: {
      height: 0,
      width: 0,
      show: false,
    },
  },
};
