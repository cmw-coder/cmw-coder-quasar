export interface Reference {
  content: string;
  depth: number;
  name: string;
  type: string;
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
  Error = -1,
}

export enum Feedback {
  None = 'None',
  Helpful = 'Helpful',
  NotHelpful = 'NotHelpful',
}

export interface ReviewItem {
  requestParams: reviewRequestParams;
  reviewId: string;
  state: ReviewState;
  result: string;
  feedback: Feedback;
}

export interface ReviewFileData {
  date: number;
  items: ReviewItem[];
}
