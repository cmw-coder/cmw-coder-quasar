export interface DataCompatibilityType {
  transparentFallback: boolean;
  zoomFix: boolean;
}

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
}

export interface DataStoreType {
  compatibility: DataCompatibilityType;
  project: Record<string, DataProjectType>;
  window: DataWindowType;
}

/*******************************************************************************
 Old Types for migrations
 *******************************************************************************/

export interface DataStoreTypeBefore_1_0_1 {
  project: {
    pathAndIdMapping: Record<string, string>;
  };
  window: {
    main: {
      height: number;
      show: boolean;
      width: number;
    };
    zoom: number;
  };
}

export interface DataStoreTypeBefore_1_0_2 {
  project: Record<
    string,
    {
      id: string;
      lastAddedLines: number;
      revision: number;
    }
  >;
  window: {
    main: {
      height: number;
      show: boolean;
      width: number;
    };
    zoom: number;
  };
}

export interface DataStoreTypeBefore_1_0_4 {
  project: Record<
    string,
    {
      id: string;
      lastAddedLines: number;
      svn: {
        directory: string;
        revision: number;
      }[];
    }
  >;
  window: {
    main: {
      height: number;
      show: boolean;
      width: number;
    };
    zoom: number;
  };
}
