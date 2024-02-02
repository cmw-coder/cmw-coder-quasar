import * as fs from 'fs';
import * as child_process from 'child_process';
import * as path from 'path';

export class SvnCodeCalc {
  private readonly svnDirectory: string | null;
  private readonly svnInfoRevision: string | null;

  constructor() {
    this.svnDirectory = this.findSvnDirectory();
    if (!this.svnDirectory) {
      console.error('ERROR: Cannot find .svn directory.');
    }

    this.svnInfoRevision = this.getSvnInfoRevision(this.svnDirectory);
    if (!this.svnInfoRevision) {
      console.error('ERROR: Failed to retrieve SVN revision.');
    }
  }

  private getSvnInfoRevision(svnDirectory: string): string | null {
    const result = child_process.execSync(`svn info ${svnDirectory}`);
    const info = result.toString();
    const revisionMatch = /Revision:\s+(\d+)/.exec(info);
    if (revisionMatch) {
      return revisionMatch[1];
    }
    return null;
  }

  private calculateCodeDiff(patchPath: string): number {
    const patchContent = fs.readFileSync(patchPath, 'utf-8');
    const lines = patchContent.split('\n');

    let codeLines = 0;
    let inBlockComment = false;

    for (const line of lines) {
      if (/^\+\s/.test(line)) {
        // Remove comments, empty lines, and multiline comments
        const cleanedLine = line.replace(
          /\/\/.*|\/\*[\s\S]*?\*\/|^\s*$/g,
          (match, p1) => {
            if (match.startsWith('/*')) {
              inBlockComment = true;
            }
            if (inBlockComment && match.endsWith('*/')) {
              inBlockComment = false;
              return '';
            }
            return inBlockComment ? match : '';
          }
        );

        if (cleanedLine.length > 0) {
          codeLines++;
        }
      }
    }

    return codeLines;
  }

  public start(): number | null {
    // Generate patch file
    const patchPath = 'daily_patch.diff';
    child_process.execSync(
      `svn diff -r ${this.svnInfoRevision} > ${patchPath}`
    );

    // Calculate code diff and return the result
    const codeDiff = this.calculateCodeDiff(patchPath);

    // Clean up the patch file
    fs.unlinkSync(patchPath);

    return codeDiff;
  }

  private findSvnDirectory(): string | null {
    let currentDir = process.cwd();
    while (currentDir !== '/') {
      const svnDir = path.join(currentDir, '.svn');
      if (fs.existsSync(svnDir)) {
        return svnDir;
      }
      currentDir = path.dirname(currentDir);
    }
    return null;
  }
}

// Usage example
// const svnCodeCalc = new SvnCodeCalc();
// const modifiedCodeLines = svnCodeCalc.start();
// if (modifiedCodeLines !== null) {
//  console.log(`Modified code lines today: ${modifiedCodeLines}`);
// }
