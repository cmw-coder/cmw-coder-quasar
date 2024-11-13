import diffLog from 'main/components/Loggers/diffLog';
import { api_reportSKU, ReportSkuDto } from 'main/request/sku';
import { FileRecorder } from 'main/services/StatisticsService/FileRecorder';
import { constructData } from 'main/services/StatisticsService/utils';
import packageJson from 'root/package.json';

const CALCULATE_TIME = 1000 * 60 * 1;

interface RecordResult {
  added: number;
  deleted: number;
}

export class FileRecorderManager {
  private fileRecorders: FileRecorder[] = [];
  private calculateTimer: NodeJS.Timer;

  constructor() {
    this.calculateTimer = setInterval(() => this.calculate(), CALCULATE_TIME);
  }

  addFileRecorder(filePath: string, projectId: string) {
    if (
      !this.fileRecorders.some((recorder) => recorder.filePath === filePath)
    ) {
      diffLog.log(`addFileRecorder ${filePath}`);
      const fileRecorder = new FileRecorder(filePath, projectId);
      fileRecorder.onDestroy = () => {
        this.fileRecorders = this.fileRecorders.filter(
          (recorder) => recorder.filePath !== filePath,
        );
      };
      this.fileRecorders.push(fileRecorder);
    }
  }

  async calculate() {
    const projectIdResultMap = new Map<string, RecordResult>();

    for (const fileRecorder of this.fileRecorders) {
      try {
        const diffResult = await fileRecorder.calculate();
        if (diffResult) {
          const { projectId } = fileRecorder;
          const currentRecord = projectIdResultMap.get(projectId) || {
            added: 0,
            deleted: 0,
          };
          currentRecord.added += diffResult.added;
          currentRecord.deleted += diffResult.deleted;
          projectIdResultMap.set(projectId, currentRecord);
        }
      } catch (error) {
        diffLog.error(
          `计算文件变更时发生错误 ${fileRecorder.filePath}: ${error}`,
        );
      }
    }

    await this.report(projectIdResultMap);
  }

  async report(projectIdResultMap: Map<string, RecordResult>) {
    const reportDataList: ReportSkuDto[] = [];

    for (const [projectId, recordResult] of projectIdResultMap) {
      if (recordResult.added > 0) {
        try {
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
        } catch (error) {
          diffLog.error(`构建报告数据时发生错误: ${error}`);
        }
      }
    }

    if (reportDataList.length > 0) {
      try {
        await api_reportSKU(reportDataList);
      } catch (error) {
        diffLog.error(`报告数据时发生错误: ${error}`);
      }
    }
  }
}
