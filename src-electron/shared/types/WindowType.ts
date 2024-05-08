export enum WindowType {
  Main = 'Main',
  Quake = 'Quake',

  // @new
  Login = 'Login',
  StartSetting = 'StartSetting',
  Setting = 'Setting',
  ProjectId = 'ProjectId',
  Chat = 'Chat',
  Commit = 'Commit',
  WorkFlow = 'WorkFlow',
  Feedback = 'Feedback',

  Completions = 'Completions',
  Update = 'Update',
}

export const windowUrlMap: Record<WindowType, string> = {
  [WindowType.Main]: '/main',

  [WindowType.Login]: '/floating/login',
  [WindowType.StartSetting]: '/floating/start-setting',
  [WindowType.Setting]: '/floating/settings',
  [WindowType.ProjectId]: '/floating/project-id',
  [WindowType.Chat]: '/floating/chat',
  [WindowType.Commit]: '/floating/commit',
  [WindowType.WorkFlow]: '/floating/workflow',
  [WindowType.Feedback]: '/floating/feedback',
  [WindowType.Update]: '/floating/update',

  [WindowType.Quake]: '/floating/quake',
  [WindowType.Completions]: '/floating/completions',
};
