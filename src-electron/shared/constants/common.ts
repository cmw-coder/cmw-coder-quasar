import { MainWindowPageType } from 'shared/types/MainWindowPageType';
import { WindowType } from 'shared/types/service/WindowServiceTrait/types';

export const ACTION_API_KEY = 'actionApi' as const;
export const CONTROL_API_KEY = 'controlApi' as const;
export const FONT_SIZE_MAPPING: Record<number, number> = {
  12: 0.91,
  14: 0.91,
  16: 0.91,
  17: 0.963,
  18: 0.91,
  20: 0.91,
  22: 0.992,
  26: 0.91,
  30: 0.91,
  34: 0.91,
  38: 0.91,
  40: 0.91,
  42: 0.91,
  48: 0.947,
  52: 0.91,
  64: 0.91,
  74: 0.934,
  104: 0.927,
};
export const NEW_LINE_REGEX = /\r\n|\r|\n/g;
export const WINDOW_URL_MAPPING: Record<WindowType, string> = {
  [WindowType.Main]: '/main',
  [WindowType.Quake]: '/floating/quake',

  [WindowType.SelectionTips]: '/floating/selection-tips',

  [WindowType.Completions]: '/floating/completions',
  [WindowType.Feedback]: '/floating/feedback',
  [WindowType.Login]: '/floating/login',
  [WindowType.ProjectId]: '/floating/project-id',
  [WindowType.Update]: '/floating/update',
  [WindowType.Welcome]: '/floating/welcome',
  [WindowType.Status]: '/floating/status',
};

export const MAIN_WINDOW_PAGE_URL_MAPPING: Record<MainWindowPageType, string> =
  {
    [MainWindowPageType.Chat]: '/main/chat',
    [MainWindowPageType.Commit]: '/main/commit',
    [MainWindowPageType.Review]: '/main/review',
    [MainWindowPageType.Setting]: '/main/settings',
    [MainWindowPageType.WorkFlow]: '/main/workflow',
  };
