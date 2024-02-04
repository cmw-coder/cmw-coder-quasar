export interface DataProjectType {
  id: string;
  lastAddedLines: number;
  svn: {
    directory: string;
    revision: number;
  }[];
}

export interface DataWindowType {
  main: {
    height: number;
    show: boolean;
    width: number;
  };
  zoom: number;
}

export interface DataStoreType {
  project: Record<string, DataProjectType>;
  window: DataWindowType;
}
