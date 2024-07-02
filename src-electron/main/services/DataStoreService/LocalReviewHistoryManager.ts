import { app } from 'electron';
import path from 'path';
import * as fs from 'fs';
import { ReviewFileData, ReviewItem } from 'shared/types/review';
import log from 'electron-log/main';

export class LocalReviewHistoryManager {
  private readonly localReviewHistoryDir: string;

  constructor() {
    this.localReviewHistoryDir = path.join(
      app.getPath('userData'),
      'reviewHistory',
    );
    this.checkLocalReviewHistoryDir();
  }

  checkLocalReviewHistoryDir() {
    if (!fs.existsSync(this.localReviewHistoryDir)) {
      fs.mkdirSync(this.localReviewHistoryDir);
    }
  }

  getReviewHistoryFiles(): string[] {
    const res: string[] = [];
    const allFiles = fs.readdirSync(this.localReviewHistoryDir);
    for (let i = 0; i < allFiles.length; i++) {
      const file = allFiles[i];
      if (file.endsWith('_review.json')) {
        const name = file.replace('_review.json', '');
        res.push(name);
      }
    }
    return res;
  }

  getReviewFileContent(name: string): ReviewItem[] {
    let res: ReviewItem[] = [];
    const filePath = path.join(
      this.localReviewHistoryDir,
      name + '_review.json',
    );
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const content = fs.readFileSync(filePath, 'utf8');
    try {
      const parsedData = JSON.parse(content) as unknown as ReviewFileData;
      res = parsedData.items;
    } catch (e) {
      log.error('getReviewFileContent error', e);
    }
    return res;
  }

  saveReviewItem(name: string, item: ReviewItem) {
    let fileParsedContent: ReviewFileData = {
      date: new Date().valueOf(),
      items: [],
    };
    const filePath = path.join(
      this.localReviewHistoryDir,
      name + '_review.json',
    );
    if (fs.existsSync(filePath)) {
      try {
        fileParsedContent = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      } catch (e) {
        log.error('saveReviewItem error', e);
      }
    }
    fileParsedContent.items.push(item);
    fs.writeFileSync(filePath, JSON.stringify(fileParsedContent));
  }
}
