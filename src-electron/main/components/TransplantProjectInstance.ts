import path from 'path';

export interface TransplantProjectOptions {
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

const scriptDirPath = process.env.PROD
  ? `"${path.join(process.resourcesPath, 'transplant-project-script')}"`
  : path.join(__dirname, '../../src-electron/assets/transplant-project-script');

export class TransplantProjectInstance {
  private diffMergeScriptPath = path.join(scriptDirPath, 'diffMerge.py');
  private compileScriptPath = path.join(scriptDirPath, 'compile.py');
  private autoTestScriptPath = path.join(scriptDirPath, 'autoTest.py');

  constructor(private options: TransplantProjectOptions) {}
}
