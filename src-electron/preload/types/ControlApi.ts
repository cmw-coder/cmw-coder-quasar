import { ipcRenderer } from 'electron';

import { CONTROL_API_KEY } from 'shared/constants/common';
import { WindowType } from 'shared/types/service/WindowServiceTrait/types';

export enum ControlType {
  Close = 'Close',
  Hide = 'Hide',
  Minimize = 'Minimize',
  Move = 'Move',
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

export class ResizeControlMessage implements ControlMessage {
  type = ControlType.Resize;
  data: { height?: number; width?: number };
  windowType: WindowType;

  constructor(
    dimension: { height?: number; width?: number },
    windowType: WindowType,
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

type GenericCallBack = (data: never) => void;

const handlerMap = new Map<WindowType, Map<ControlType, GenericCallBack>>();

// -------------------------------------------------------------------------------------------------------
// ↑↑↑↑↑↑↑↑↑↑                                   Local stuff                                     ↑↑↑↑↑↑↑↑↑↑
// -------------------------------------------------------------------------------------------------------

export const triggerControlCallback = (
  windowType: WindowType,
  controlType: ControlType,
  data: unknown,
) => {
  handlerMap.get(windowType)?.get(controlType)?.(<never>data);
};

export const sendControlAction = (message: ControlMessageUnion) =>
  ipcRenderer.send(CONTROL_API_KEY, message);
