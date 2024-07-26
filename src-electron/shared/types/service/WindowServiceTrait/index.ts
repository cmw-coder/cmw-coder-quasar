import { MainWindowPageType } from 'shared/types/MainWindowPageType';
import { ExtraData, Selection } from 'shared/types/Selection';
import { WindowType } from 'shared/types/WindowType';
import { Feedback, ReviewData } from 'shared/types/review';

export interface WindowServiceTrait {
  finishLogin(): Promise<void>;
  finishWelcome(): Promise<void>;
  toggleMaximizeWindow(type?: WindowType): Promise<void>;
  defaultWindowSize(type: WindowType): Promise<void>;
  minimizeWindow(type?: WindowType): Promise<void>;
  closeWindow(type?: WindowType): Promise<void>;
  hideWindow(type?: WindowType): Promise<void>;
  getProjectIdWindowActiveProject(): Promise<string | undefined>;
  getCommitWindowCurrentFile(): Promise<string | undefined>;
  activeWindow(type: WindowType): Promise<void>;
  setWindowSize(
    size: {
      width: number;
      height: number;
    },
    type?: WindowType,
  ): Promise<void>;
  openDevTools(type?: WindowType): Promise<void>;
  mouseMoveInOrOutWindow(type: WindowType): Promise<void>;
  setMainWindowPageReady(type: MainWindowPageType): Promise<void>;
  addSelectionToChat(selection?: Selection): Promise<void>;
  reviewFile(path: string): Promise<void>;
  reviewSelection(selection?: Selection): Promise<void>;
  getReviewData(): Promise<ReviewData[]>;
  setReviewFeedback(data: {
    reviewId: string;
    feedback: Feedback;
    extraData: ExtraData;
    createTime: number;
    comment?: string;
  }): Promise<void>;
  retryReview(reviewData: ReviewData): Promise<void>;
  stopReview(reviewId: string): Promise<void>;
  getWindowIsFixed(windowType: WindowType): Promise<boolean>;
  toggleWindowFixed(windowType: WindowType): Promise<void>;
}
