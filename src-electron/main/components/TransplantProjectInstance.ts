import { executeCommand } from 'main/utils/common';
import path from 'path';
import {
  TransplantProjectStep,
  TransplantProjectOptions,
  TransplantProjectData,
} from 'shared/types/transplantProject';

const scriptDirPath = process.env.PROD
  ? `"${path.join(process.resourcesPath, 'transplant-project-script')}"`
  : path.join(__dirname, '../../src-electron/assets/transplant-project-script');

export class TransplantProjectInstance {
  private diffMergeScriptPath = path.join(scriptDirPath, 'diffMerge.py');
  private compileScriptPath = path.join(scriptDirPath, 'compile.py');
  private autoTestScriptPath = path.join(scriptDirPath, 'autoTest.py');
  private diffMergeResult = '';
  private compileResult = '';
  private autoTestResult = '';
  private isError = false;
  private errorInfo = '';
  private step = TransplantProjectStep.diffMerge;

  constructor(private options: TransplantProjectOptions) {
    this.runDiffMerge();
  }

  private async runDiffMerge() {
    this.step = TransplantProjectStep.diffMerge;
    try {
      const command = `python ${this.diffMergeScriptPath} --dir ${this.options.projectDirPath} --originBranch ${this.options.originBranch} --targetBranch ${this.options.targetBranch}`;
      const { stderr, stdout } = await executeCommand(command);
      if (stderr) {
        throw new Error(stderr);
      } else {
        this.diffMergeResult = stdout;
      }
    } catch (e) {
      this.isError = true;
      this.errorInfo = (e as Error).message;
    }
    this.step = TransplantProjectStep.diffMergeDone;
  }

  private async runCompile() {
    this.step = TransplantProjectStep.compile;
    try {
      const command = `python ${this.compileScriptPath} --targetBranch ${this.options.targetBranch}`;
      const { stderr, stdout } = await executeCommand(command);
      if (stderr) {
        throw new Error(stderr);
      } else {
        this.compileResult = stdout;
      }
    } catch (e) {
      this.isError = true;
      this.errorInfo = (e as Error).message;
    }
  }

  private async runAutoTest() {
    this.step = TransplantProjectStep.autoTest;
    try {
      const command = `python ${this.autoTestScriptPath} --targetBranch ${this.options.targetBranch}`;
      const { stderr, stdout } = await executeCommand(command);
      if (stderr) {
        throw new Error(stderr);
      } else {
        this.autoTestResult = stdout;
      }
    } catch (e) {
      this.isError = true;
      this.errorInfo = (e as Error).message;
    }
    this.step = TransplantProjectStep.autoTestDone;
  }

  getData() {
    return {
      step: this.step,
      diffMergeResult: this.diffMergeResult,
      compileResult: this.compileResult,
      autoTestResult: this.autoTestResult,
      isError: this.isError,
      errorInfo: this.errorInfo,
      options: this.options,
    } as TransplantProjectData;
  }
}
