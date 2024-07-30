import { app } from 'electron';
import path from 'path';
import * as fs from 'fs';
import { ReviewFileData, ReviewData } from 'shared/types/review';
import log from 'electron-log/main';

export class LocalReviewHistoryManager {
  private readonly localReviewHistoryDir: string;

  constructor() {
    this.localReviewHistoryDir = path.join(
      app.getPath('userData'),
      'reviewHistoryV2',
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

  getReviewFileContent(name: string): ReviewData[] {
    let res: ReviewData[] = [];
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
    // 整理格式
    res.forEach((item) => {
      if (!item.createTime) {
        item.createTime = 0;
      }
      if (!item.startTime) {
        item.startTime = 0;
      }
      if (!item.endTime) {
        item.endTime = 0;
      }
      if (!item.referenceTime) {
        item.referenceTime = 0;
      }
    });
    return res;
  }

  saveReviewItem(name: string, item: ReviewData) {
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
    const existItemIndex = fileParsedContent.items.findIndex(
      (i) => i.reviewId === item.reviewId,
    );
    if (existItemIndex !== -1) {
      // delete
      fileParsedContent.items.splice(existItemIndex, 1);
    }
    fileParsedContent.items.push(item);
    fs.writeFileSync(filePath, JSON.stringify(fileParsedContent));
  }
}
