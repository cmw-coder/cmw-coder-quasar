export interface TransplantProjectOptions {
  projectDirPath: string;
  originBranch: string;
  targetBranch: string;
}

export enum TransplantProjectStep {
  diffMerge = 'diffMerge',
  diffMergeDone = 'diffMergeDone',
  compile = 'compile',
  compileDone = 'compileDone',
  autoTest = 'autoTest',
  autoTestDone = 'autoTestDone',
}

export interface TransplantProjectData {
  step: TransplantProjectStep;
  diffMergeResult: string;
  compileResult: string;
  autoTestResult: string;
  isError: boolean;
  errorInfo: string;
  options: TransplantProjectOptions;
}
