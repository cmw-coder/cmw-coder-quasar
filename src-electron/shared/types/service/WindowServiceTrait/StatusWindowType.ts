export enum Status {
  READY = 'READY',
  GENERATING = 'GENERATING',
  ERROR = 'ERROR',
}

export interface StatusData {
  status: Status;
  detail: string;
}
