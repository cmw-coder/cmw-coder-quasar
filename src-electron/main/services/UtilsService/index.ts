import log from 'electron-log/main';
import { existsSync } from 'fs';
import { lstat, readFile } from 'fs/promises';
import { decode } from 'iconv-lite';
import { injectable } from 'inversify';

import { UtilsServiceTrait } from 'shared/types/service/UtilsServiceTrait';

@injectable()
export class UtilsService implements UtilsServiceTrait {
  async checkFolderExist(path: string): Promise<boolean> {
    return existsSync(path) && (await lstat(path)).isDirectory();
  }

  async getFileContent(path: string): Promise<string | undefined> {
    try {
      return decode(await readFile(path), 'gbk');
    } catch (e) {
      log.error('getFileContent', e);
      return undefined;
    }
  }
}
