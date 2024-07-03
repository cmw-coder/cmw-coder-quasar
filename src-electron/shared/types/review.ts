import { Selection } from 'shared/types/Selection';

export enum ReferenceType {
  Struct = 'Struct',
  Macro = 'Macro',
}

export interface Reference {
  name: string;
  type: ReferenceType;
  content: string;
  depth: number; // Depth of call hierarchy, start from 0
  path: string;
  range: {
    begin: number;
    end: number;
  };
}

export interface reviewRequestParams {
  productLine: string;
  profileModel: string;
  templateName: string;
  references: Reference[];
  target: {
    block: string;
    snippet: string;
  };
}

export enum ReviewState {
  References = 0,
  Start = 1,
  First = 2,
  Second = 3,
  Third = 4,
  Finished = 100,
  Error = -1,
}

export enum Feedback {
  None = 'None',
  Helpful = 'Helpful',
  NotHelpful = 'NotHelpful',
}

export interface ReviewData {
  references: Reference[];
  selection: Selection;
  reviewId: string;
  state: ReviewState;
  result: string;
  feedback: Feedback;
  errorInfo: string;
}

export interface ReviewFileData {
  date: number;
  items: ReviewData[];
}
