export interface DataProjectType {
  pathAndIdMapping: Record<string, string>;
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
  project: DataProjectType;
  window: DataWindowType;
}
