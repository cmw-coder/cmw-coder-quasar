import { ipcRenderer } from 'electron';

import { controlApiKey } from 'shared/types/constants';
import { WindowType } from 'shared/types/WindowType';

export enum ControlType {
  Close = 'Close',
  DevTools = 'DevTools',
  Hide = 'Hide',
  Minimize = 'Minimize',
  Move = 'Move',
  Reload = 'Reload',
  Resize = 'Resize',
  Show = 'Show',
  ToggleMaximize = 'ToggleMaximize',
}

export interface ControlMessage {
  type: ControlType;
  data: unknown;
  windowType: WindowType;
}

export class CloseControlMessage implements ControlMessage {
  type = ControlType.Close;
  data: undefined;
  windowType: WindowType;

  constructor(windowType: WindowType) {
    this.windowType = windowType;
  }
}

export class DevToolsControlMessage implements ControlMessage {
  type = ControlType.DevTools;
  data: undefined;
  windowType: WindowType;

  constructor(windowType: WindowType) {
    this.windowType = windowType;
  }
}

export class HideControlMessage implements ControlMessage {
  type = ControlType.Hide;
  data: undefined;
  windowType: WindowType;

  constructor(windowType: WindowType) {
    this.windowType = windowType;
  }
}

export class MinimizeControlMessage implements ControlMessage {
  type = ControlType.Minimize;
  data: undefined;
  windowType: WindowType;

  constructor(windowType: WindowType) {
    this.windowType = windowType;
  }
}

export class MoveControlMessage implements ControlMessage {
  type = ControlType.Move;
  data: { x?: number; y?: number };
  windowType: WindowType;

  constructor(position: { x?: number; y?: number }, windowType: WindowType) {
    this.data = position;
    this.windowType = windowType;
  }
}

export class ReloadControlMessage implements ControlMessage {
  type = ControlType.Reload;
  data: undefined;
  windowType: WindowType;

  constructor(windowType: WindowType) {
    this.windowType = windowType;
  }
}

export class ResizeControlMessage implements ControlMessage {
  type = ControlType.Resize;
  data: { height?: number; width?: number };
  windowType: WindowType;

  constructor(
    dimension: { height?: number; width?: number },
    windowType: WindowType
  ) {
    this.data = dimension;
    this.windowType = windowType;
  }
}

export class ShowControlMessage implements ControlMessage {
  type = ControlType.Show;
  data: undefined;
  windowType: WindowType;

  constructor(windowType: WindowType) {
    this.windowType = windowType;
  }
}

export class ToggleMaximizeControlMessage implements ControlMessage {
  type = ControlType.ToggleMaximize;
  data: undefined;
  windowType = WindowType.Main;
}

// -------------------------------------------------------------------------------------------------------
// ↓↓↓↓↓↓↓↓↓↓                                   Local stuff                                     ↓↓↓↓↓↓↓↓↓↓
// -------------------------------------------------------------------------------------------------------

type ControlMessageUnion =
  | CloseControlMessage
  | HideControlMessage
  | MinimizeControlMessage
  | MoveControlMessage
  | ResizeControlMessage
  | ShowControlMessage
  | ToggleMaximizeControlMessage;

interface ControlMessageMapping {
  [ControlType.Close]: CloseControlMessage;
  [ControlType.DevTools]: DevToolsControlMessage;
  [ControlType.Hide]: HideControlMessage;
  [ControlType.Minimize]: MinimizeControlMessage;
  [ControlType.Move]: MoveControlMessage;
  [ControlType.Reload]: ReloadControlMessage;
  [ControlType.Resize]: ResizeControlMessage;
  [ControlType.Show]: ShowControlMessage;
  [ControlType.ToggleMaximize]: ToggleMaximizeControlMessage;
}

type GenericCallBack = (data: never) => void;

const handlerMap = new Map<WindowType, Map<ControlType, GenericCallBack>>();

// -------------------------------------------------------------------------------------------------------
// ↑↑↑↑↑↑↑↑↑↑                                   Local stuff                                     ↑↑↑↑↑↑↑↑↑↑
// -------------------------------------------------------------------------------------------------------

export const registerControlCallback = <T extends keyof ControlMessageMapping>(
  windowType: WindowType,
  controlType: T,
  callback: (data: ControlMessageMapping[T]['data']) => void
) => {
  if (handlerMap.has(windowType)) {
    handlerMap.get(windowType)?.set(controlType, callback);
  } else {
    handlerMap.set(windowType, new Map([[controlType, callback]]));
  }
};

export const triggerControlCallback = (
  windowType: WindowType,
  controlType: ControlType,
  data: unknown
) => {
  handlerMap.get(windowType)?.get(controlType)?.(<never>data);
};

export const sendControlAction = (message: ControlMessageUnion) =>
  ipcRenderer.send(controlApiKey, message);
