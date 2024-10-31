import { readFile } from 'fs/promises';
import iconv from 'iconv-lite';
import { container } from 'main/services';
import { ServiceType } from 'shared/types/service';
import { WindowService } from 'main/services/WindowService';
import { WindowType } from 'shared/types/WindowType';

const DESTROY_TIME = 1000 * 60 * 30;

export class FileRecorder {
  filePath: string;
  projectId: string;
  fileContent = '';
  lastChangedTime = Date.now();
  onDestroy: () => void = () => {};

  constructor(filePath: string, projectId: string) {
    this.filePath = filePath;
    this.projectId = projectId;
    this.readFileContent().then((content) => {
      this.fileContent = content;
    });
  }

  async readFileContent() {
    const fileBuffer = await readFile(this.filePath);
    return iconv.decode(fileBuffer, 'gb2312');
  }

  async calculate() {
    const newFileContent = await this.readFileContent();
    if (newFileContent === this.fileContent) {
      // 文件内容没有变化
      if (Date.now() - this.lastChangedTime >= DESTROY_TIME) {
        this.onDestroy();
      }
      return undefined;
    } else {
      // 文件内容发生变化
      const diffSubprocess = container
        .get<WindowService>(ServiceType.WINDOW)
        .getWindow(WindowType.Completions).diffSubprocess;
      const diffResult = await diffSubprocess.proxyFn.diffLine(
        this.fileContent,
        newFileContent,
      );
      this.fileContent = newFileContent;
      this.lastChangedTime = Date.now();
      return diffResult;
    }
  }
}
