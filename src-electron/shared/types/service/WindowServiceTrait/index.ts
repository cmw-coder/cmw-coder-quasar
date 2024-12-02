import {
  Feedback,
  ReviewData,
  ReviewFileItem,
  SelectionData,
} from 'cmw-coder-subprocess';

import { MainWindowPageType } from 'shared/types/MainWindowPageType';
import { WindowType } from 'shared/types/WindowType';

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
  addSelectionToChat(selectionData?: SelectionData): Promise<void>;
  reviewFile(path: string): Promise<void>;
  reviewSelection(selectionData?: SelectionData): Promise<void>;
  getWindowIsFixed(windowType: WindowType): Promise<boolean>;
  toggleWindowFixed(windowType: WindowType): Promise<void>;
  getReviewData(): Promise<ReviewData[]>;
  setReviewFeedback(data: {
    serverTaskId: string;
    userId: string;
    feedback: Feedback;
    timestamp: number;
    comment: string;
  }): Promise<void>;
  retryReview(reviewId: string): Promise<void>;
  stopReview(reviewId: string): Promise<void>;
  delReview(reviewId: string): Promise<void>;
  delReviewByFile(filePath: string): Promise<void>;
  reviewProject(filePath?: string): Promise<void>;
  getReviewFileList(): Promise<ReviewFileItem[]>;
  getFileReviewList(filePath: string): Promise<ReviewData[]>;
  clearReview(): Promise<unknown>;
  getReviewHistoryFiles(): Promise<string[]>;
  getReviewFileContent(filePath: string): Promise<ReviewData[]>;
}
