import { app } from 'electron';
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync } from 'fs';
import { basename, join } from 'path';

export class LocalBackupManager {
  private readonly localBackupDir: string;

  constructor() {
    this.localBackupDir = join(app.getPath('userData'), 'backups');
    this._checkBackupDir();
  }

  createBackup(originalPath: string, projectId: string): string {
    const backupPath = join(
      this.localBackupDir,
      `${new Date().valueOf()}-${projectId}-${basename(originalPath)}`,
    );
    copyFileSync(originalPath, backupPath);
    return backupPath;
  }

  deleteBackups(backupPathList?: string[]) {
    if (!backupPathList) {
      return;
    }
    for (const path of backupPathList) {
      rmSync(path, { force: true });
    }
  }

  restoreBackup(backupPath: string, originalPath: string) {
    copyFileSync(backupPath, originalPath);
  }

  retrieveBackup(backupPath: string): ArrayBufferLike | undefined {
    if (!existsSync(backupPath)) {
      return;
    }
    return readFileSync(backupPath).buffer;
  }

  private _checkBackupDir() {
    if (!existsSync(this.localBackupDir)) {
      mkdirSync(this.localBackupDir);
    }
  }
}
