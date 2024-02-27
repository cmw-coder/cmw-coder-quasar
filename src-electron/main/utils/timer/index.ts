import { DateTime, Duration } from 'luxon';

import { Record } from 'main/utils/timer/types';

class Timer {
  private _recordMap = new Map<string, Record[]>();

  add(category: string, name: string) {
    const currentTimePoint = DateTime.now();
    const records = this._recordMap.get(category);
    if (records) {
      const duration = records
        .at(-1)
        ?.timePoint.until(currentTimePoint)
        .toDuration();
      records.push({
        duration:
          !duration || !duration.isValid ? Duration.fromMillis(0) : duration,
        name,
        timePoint: currentTimePoint,
      });
    } else {
      this._recordMap.set(category, [
        {
          duration: Duration.fromMillis(0),
          name,
          timePoint: currentTimePoint,
        },
      ]);
    }
  }

  remove(category: string) {
    this._recordMap.delete(category);
  }

  parse(category?: string, indent: number = 2): string | undefined {
    if (category) {
      const records = this._recordMap.get(category);
      if (records) {
        return this._stringify(category, records, indent);
      }
      return undefined;
    } else {
      const result: string[] = [];
      this._recordMap.forEach((records, category) => {
        result.push(this._stringify(category, records, indent));
      });
      return result.join('\n');
    }
  }

  private _stringify(
    category: string,
    records: Record[],
    indent: number,
  ): string {
    const firstRecord = records.at(0);
    const lastRecord = records.at(-1);
    if (firstRecord && lastRecord) {
      const totalDuration = firstRecord.timePoint.until(lastRecord.timePoint);
      const title = `Category '${category}' costs ${totalDuration.toDuration().toMillis()}ms, details: \n`;
      return (
        title +
        records
          .map(
            (record) =>
              `${' '.repeat(indent)}'${record.name}' costs ${record.duration.toMillis()}ms`,
          )
          .join('\n')
      );
    }
    return `Category '${category}' has no valid records`;
  }
}

export const timer = new Timer();
