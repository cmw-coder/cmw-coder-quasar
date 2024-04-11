import log from 'electron-log/main';
import { injectable } from 'inversify';
import { detect } from 'jschardet';
import { ChangedFile, SvnStatusItem } from 'shared/types/svn';
import { formatStatusRes } from 'service/entities/SvnService/util';
import { spawn } from 'child_process';
import { decode } from 'iconv-lite';
import xml2js from 'xml2js';

@injectable()
export class SvnService {
  status(dirPath: string) {
    return new Promise<SvnStatusItem[]>((resolve) => {
      let stdout = '';
      let stderr = '';
      const childProcess = spawn('svn', ['status', '--xml'], {
        cwd: dirPath,
      });
      childProcess.stdout.on('data', (data) => {
        const detectRes = detect(data);
        if (detectRes.encoding !== 'UTF-8') {
          detectRes.encoding = 'GBK';
        }
        stdout += decode(data, detectRes.encoding);
      });
      childProcess.stderr.on('data', (data) => {
        const detectRes = detect(data);
        if (detectRes.encoding !== 'UTF-8') {
          detectRes.encoding = 'GBK';
        }
        stderr += decode(data, detectRes.encoding);
      });
      process.on('exit', (code: number, sig: number) => {
        if (childProcess.connected) {
          childProcess.kill(sig);
        }
      });
      childProcess.on('error', (err) => {
        log.error('SVN Get status error:', err);
        log.error('SVN Get status error:', stderr);
      });
      childProcess.on('close', (code) => {
        if (code === 0) {
          xml2js.parseString(
            stdout,
            {
              attrkey: '_attribute',
              charkey: '_text',
              explicitCharkey: true,
              explicitArray: false,
            },
            (err, result) => {
              resolve(formatStatusRes(result));
            },
          );
        } else {
          resolve([]);
        }
      });
    });
  }

  fileDiff(projectPath: string, filePath: string) {
    return new Promise<string>((resolve) => {
      let stdout = '';
      let stderr = '';
      const childProcess = spawn('svn', ['diff', filePath], {
        cwd: projectPath,
      });
      childProcess.stdout.on('data', (data) => {
        const detectRes = detect(data);
        if (detectRes.encoding !== 'UTF-8') {
          detectRes.encoding = 'GBK';
        }
        stdout += decode(data, detectRes.encoding);
      });
      childProcess.stderr.on('data', (data) => {
        const detectRes = detect(data);
        if (detectRes.encoding !== 'UTF-8') {
          detectRes.encoding = 'GBK';
        }
        stderr += decode(data, detectRes.encoding);
      });
      childProcess.on('close', (code) => {
        if (code === 0) {
          resolve(stdout);
        } else {
          resolve(stderr);
        }
      });
    });
  }

  async dirDiff(dirPath: string) {
    const result = [] as ChangedFile[];
    const files = await this.status(dirPath);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const diffDetail = await this.fileDiff(dirPath, file.path);
      let added = 0;
      let deleted = 0;
      const lines = diffDetail.split(/\r?\n/);
      lines.forEach((line) => {
        if (line.startsWith('+') && !line.startsWith('+++')) {
          added++;
        } else if (line.startsWith('-') && !line.startsWith('---')) {
          deleted++;
        }
      });
      result.push({
        ...file,
        additions: added,
        deletions: deleted,
        diff: diffDetail,
      });
    }
    return result;
  }

  commit(dirPath: string, commitMessage: string) {
    return new Promise<string>((resolve, reject) => {
      let stdout = '';
      let stderr = '';
      const childProcess = spawn('svn', ['commit', '-m', commitMessage], {
        cwd: dirPath,
      });
      childProcess.stdout.on('data', (data) => {
        const detectRes = detect(data);
        if (detectRes.encoding !== 'UTF-8') {
          detectRes.encoding = 'GBK';
        }
        stdout += decode(data, detectRes.encoding);
      });
      childProcess.stderr.on('data', (data) => {
        const detectRes = detect(data);
        if (detectRes.encoding !== 'UTF-8') {
          detectRes.encoding = 'GBK';
        }
        stderr += decode(data, detectRes.encoding);
      });
      childProcess.on('close', (code) => {
        if (code === 0) {
          resolve(stdout);
        } else {
          reject(stderr);
        }
      });
    });
  }
}
