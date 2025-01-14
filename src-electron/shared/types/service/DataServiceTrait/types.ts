import { WindowType } from 'shared/types/service/WindowServiceTrait/types';

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

export interface BackupData {
  backupPathList: string[];
  originalPath: string;
  projectId: string;
}

export interface CompatibilityData {
  transparentFallback: boolean;
  zoomFix: boolean;
}

export interface ProjectData {
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
  backup: {
    current?: BackupData;
    previous?: BackupData;
  };
  compatibility: CompatibilityData;
  notice: {
    dismissed: string[];
  };
  project: Record<string, ProjectData>;
  window: WindowDataMap;
}

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
