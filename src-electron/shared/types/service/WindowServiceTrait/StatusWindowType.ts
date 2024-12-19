export enum Status {
  Standby = 'Standby',
  Prompting = 'Prompting',
  Requesting = 'Requesting',
  Empty = 'Empty',
  Failed = 'Failed',
}

export interface StatusData {
  status: Status;
  detail: string;
}
