import { DateTime, Duration } from 'luxon';

export interface Record {
  duration: Duration<true>;
  name: string;
  timePoint: DateTime<true>;
}
