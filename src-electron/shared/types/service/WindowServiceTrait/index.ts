import { MainWindowPageType } from 'shared/types/MainWindowPageType';
import { Selection } from 'shared/types/Selection';
import { WindowType } from 'shared/types/WindowType';
import { Feedback, ReviewType, ReviewTypeMapping } from 'shared/types/review';

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
  getReviewData<T extends ReviewType>(
    reviewType: T,
  ): Promise<ReviewTypeMapping[T]>;
  setActiveReviewFeedback(feedback: Feedback, comment?: string): Promise<void>;
  retryActiveReview(): Promise<void>;
  stopActiveReview(): Promise<void>;
  getWindowIsFixed(windowType: WindowType): Promise<boolean>;
  toggleWindowFixed(windowType: WindowType): Promise<void>;
}
