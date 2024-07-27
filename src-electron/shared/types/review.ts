import { SymbolType } from 'shared/types/common';
import { ExtraData, Selection } from 'shared/types/Selection';

export interface Reference {
  name: string;
  type: SymbolType;
  content: string;
  depth: number; // Depth of call hierarchy, start from 0
  path: string;
  range: {
    startLine: number;
    endLine: number;
  };
}

export interface ReviewRequestParams {
  productLine: string;
  profileModel: string;
  templateName: string;
  references: Reference[];
  language: string;
  target: {
    block: string;
    snippet: string;
  };
}

export enum ReviewState {
  References = 0,
  Start = 1,
  /**
   * @deprecated
   */
  First = 2,
  /**
   * @deprecated
   */
  Second = 3,
  /**
   * @deprecated
   */
  Third = 4,
  Finished = 100,
  Error = -1,
}

export enum ReviewType {
  File = 'File',
  Function = 'Function',
}

export interface ReviewTypeMapping {
  [ReviewType.File]: ReviewData[];
  [ReviewType.Function]: ReviewData | undefined;
}

export enum Feedback {
  None = 'None',
  Helpful = 'Helpful',
  NotHelpful = 'NotHelpful',
}

export interface ReviewParsedResult {
  Type: string;
  IsProblem: string;
  Number: number;
  ProblemCodeSnippet: string;
  Description: string;
}

export interface ReviewResult {
  parsed: boolean;
  data: ReviewParsedResult[];
  originData: string;
}

export interface ReviewData {
  references: Reference[];
  selection: Selection;
  reviewId: string;
  state: ReviewState;
  result: ReviewResult;
  feedback: Feedback;
  errorInfo: string;
  extraData: ExtraData;
  reviewType: ReviewType;
}

export interface ReviewFileData {
  date: number;
  items: ReviewData[];
}
