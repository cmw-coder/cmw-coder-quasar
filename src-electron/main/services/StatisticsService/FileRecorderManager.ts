import statisticsLog from 'main/components/Loggers/statisticsLog';
import { api_reportSKU, ReportSkuDto } from 'main/request/sku';
import { FileRecorder } from 'main/services/StatisticsService/FileRecorder';
import { constructData } from 'main/services/StatisticsService/utils';
import packageJson from 'root/package.json';

const REPORT_TIME = 1000 * 60 * 5;
const CALCULATE_TIME = 1000 * 60 * 1;

interface RecordResult {
  added: number;
  deleted: number;
}

export class FileRecorderManager {
  private fileRecorders: FileRecorder[] = [];
  private recordResultMap: Map<string, [string, RecordResult]> = new Map();
  private calculateTimer: NodeJS.Timer;
  private reportTimer: NodeJS.Timer;
  constructor() {
    this.calculateTimer = setInterval(() => {
      this.calculate();
    }, CALCULATE_TIME);
    this.reportTimer = setInterval(() => {
      this.report();
    }, REPORT_TIME);
  }

  addFileRecorder(filePath: string, projectId: string) {
    const data = this.recordResultMap.get(filePath);
    if (data) {
      data[0] = projectId;
      return;
    }
    if (
      this.fileRecorders.find(
        (fileRecorder) => fileRecorder.filePath === filePath,
      )
    ) {
      return;
    }
    statisticsLog.log(`addFileRecorder ${filePath}`);
    const fileRecorder = new FileRecorder(filePath, projectId);
    fileRecorder.onDestroy = () => {
      this.fileRecorders = this.fileRecorders.filter(
        (fileRecorder) => fileRecorder.filePath !== filePath,
      );
    };
    this.fileRecorders.push(fileRecorder);
  }

  async calculate() {
    for (let i = 0; i < this.fileRecorders.length; i++) {
      const fileRecorder = this.fileRecorders[i];
      const diffResult = await fileRecorder.calculate();
      if (diffResult) {
        const data = this.recordResultMap.get(fileRecorder.filePath);
        if (data) {
          const recordResult = data[1];
          recordResult.added += diffResult.added;
          recordResult.deleted += diffResult.deleted;
        } else {
          this.recordResultMap.set(fileRecorder.filePath, [
            fileRecorder.projectId,
            diffResult,
          ]);
        }
      }
    }
  }

  async report() {
    const projectIdResultMap = new Map<string, RecordResult>();
    for (const [, [projectId, recordResult]] of this.recordResultMap) {
      const projectIdResult = projectIdResultMap.get(projectId);
      if (projectIdResult) {
        projectIdResult.added += recordResult.added;
        projectIdResult.deleted += recordResult.deleted;
      } else {
        projectIdResultMap.set(projectId, recordResult);
      }
    }
    this.recordResultMap.clear();
    const reportDataList: ReportSkuDto[] = [];
    for (const [projectId, recordResult] of projectIdResultMap) {
      if (recordResult.added > 0) {
        const reportData = await constructData(
          recordResult.added,
          Date.now(),
          Date.now(),
          projectId,
          packageJson.version,
          'INC',
          '',
        );
        reportDataList.push(...reportData);
      }
    }
    if (reportDataList.length > 0) {
      await api_reportSKU(reportDataList);
    }
  }
}
