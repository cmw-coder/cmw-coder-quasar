import { WindowType } from 'shared/types/WindowType';

export enum TemplateType {
  CodeAddComment = 'CodeAddComment',
  CodeExplanation = 'CodeExplanation',
  CodeGenerate = 'CodeGenerate',
  CodeOptimization = 'CodeOptimization',
  CodeReview = 'CodeReview',
  ExceptionAnalysis = 'ExceptionAnalysis',
  FileAddComment = 'FileAddComment',
  GenerateCommitMessage = 'GenerateCommitMessage',
  GenerateUnitTest = 'GenerateUnitTest',
  Readable = 'Readable',
  SecurityIssues = 'SecurityIssues',
  ShortLineCode = 'ShortLineCode',
  StyleIssues = 'StyleIssues',
  PasteFix = 'PasteFix',
}

interface PromptTemplate {
  // 单行
  common: string;
  // 多行
  commonMulti: string;
  // 行内
  commonInline: string;
  // 外挂知识库
  embedding: string;
}

export interface DataCompatibilityType {
  transparentFallback: boolean;
  zoomFix: boolean;
}

export interface DataProjectType {
  id: string;
  isAutoManaged: boolean;
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
  fixed?: boolean;
}

export type WindowDataMap = Record<WindowType, WindowData>;

export interface AppData {
  compatibility: DataCompatibilityType;
  project: Record<string, DataProjectType>;
  window: WindowDataMap;
}

export const defaultAppData: AppData = {
  compatibility: {
    transparentFallback: false,
    zoomFix: false,
  },
  project: {},
  window: {
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
    [WindowType.Welcome]: {
      height: 600,
      width: 800,
      show: false,
    },
    [WindowType.ProjectId]: {
      height: 600,
      width: 800,
      show: false,
    },
    [WindowType.Feedback]: {
      height: 800,
      width: 800,
      show: false,
    },
    [WindowType.Update]: {
      height: 800,
      width: 800,
      show: false,
    },
    [WindowType.SelectionTips]: {
      height: 34,
      width: 455,
      show: false,
    },
    [WindowType.Status]: {
      height: 32,
      width: 200,
      show: false,
      x: 200,
      y: 0,
    },
  },
};

export interface ModelConfig {
  template: Record<TemplateType, string>;
  config: {
    modelKey: string;
    displayName: string;
  };
  prompt: Record<
    string,
    {
      other: {
        comment: PromptTemplate;
        code: PromptTemplate;
      };
    }
  >;
}

export type ModelConfigMap = Record<string, ModelConfig>;
