export interface DataWindowType {
  main: {
    height: number;
    show: boolean;
    width: number;
  };
  zoom: number;
}

export interface DataStoreType {
  window: DataWindowType;
}
