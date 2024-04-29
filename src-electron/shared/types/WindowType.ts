export enum WindowType {
  /**
   * @deprecated
   */
  Floating = 'Floating',
  /**
   * @deprecated
   */
  Immersive = 'Immersive',

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

  Completions = 'Completions',
}

export const windowUrlMap: Record<WindowType, string> = {
  [WindowType.Floating]: '/floating',
  [WindowType.Immersive]: '/immersive',
  [WindowType.Main]: '/main',

  [WindowType.Login]: '/floating/login',
  [WindowType.StartSetting]: '/floating/start-setting',
  [WindowType.Setting]: '/floating/setting',
  [WindowType.ProjectId]: '/floating/project-id',
  [WindowType.Chat]: '/floating/chat',
  [WindowType.Commit]: '/floating/commit',
  [WindowType.WorkFlow]: '/floating/workflow',

  [WindowType.Quake]: '/immersive/quake',
  [WindowType.Completions]: '/immersive/completions',
};
