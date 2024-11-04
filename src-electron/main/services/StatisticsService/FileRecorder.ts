import { readFile, stat } from 'fs/promises';
import iconv from 'iconv-lite';
import { container } from 'main/services';
import { ServiceType } from 'shared/types/service';
import { WindowService } from 'main/services/WindowService';
import { WindowType } from 'shared/types/WindowType';

const DESTROY_TIME = 1000 * 60 * 30;

export class FileRecorder {
  filePath: string;
  projectId: string;
  lastFileContent = '';
  lastModifiedTime = new Date();
  onDestroy: () => void = () => {};

  constructor(filePath: string, projectId: string) {
    this.filePath = filePath;
    this.projectId = projectId;
    this.readFileContent().then((content) => {
      this.lastFileContent = content;
    });
    this.getFileModifiedTime().then((mtime) => {
      this.lastModifiedTime = mtime;
    });
  }

  async getFileModifiedTime() {
    const { mtime } = await stat(this.filePath);
    return mtime;
  }

  async readFileContent() {
    const fileBuffer = await readFile(this.filePath);
    return iconv.decode(fileBuffer, 'gb2312');
  }

  async calculate() {
    // TODO
    // 通过读取文件更改时间判断文件是否发生变化
    const newModifiedTime = await this.getFileModifiedTime();
    if (newModifiedTime.getTime() === this.lastModifiedTime.getTime()) {
      // 文件没有变化
      if (Date.now() - this.lastModifiedTime.getTime() >= DESTROY_TIME) {
        this.onDestroy();
      }
      return undefined;
    } else {
      // 文件发生变化
      const newFileContent = await this.readFileContent();
      const diffSubprocess = container
        .get<WindowService>(ServiceType.WINDOW)
        .getWindow(WindowType.Completions).diffSubprocess;
      const diffResult = await diffSubprocess.proxyFn.diffLine(
        this.lastFileContent,
        newFileContent,
      );
      this.lastFileContent = newFileContent;
      this.lastModifiedTime = newModifiedTime;
      return diffResult;
    }
  }
}
