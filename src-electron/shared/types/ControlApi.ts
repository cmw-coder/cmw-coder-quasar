import { ipcRenderer } from 'electron';

export const controlApiKey = 'controlApi' as const;

export enum WindowType {
  Main = 'Main',
  CompletionInline = 'CompletionInline',
  CompletionSnippet = 'CompletionSnippet',
}

export enum ControlType {
  Close = 'Close',
  Hide = 'Hide',
  Minimize = 'Minimize',
  Move = 'Move',
  Resize = 'Resize',
  Show = 'Show',
  ToggleMaximize = 'ToggleMaximize',
}

interface ControlMessage {
  type: ControlType;
  data: unknown;
  windowType: WindowType;
}

export class CloseControlMessage implements ControlMessage {
  type = ControlType.Close;
  data: undefined;
  windowType = WindowType.Main;
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

export interface ControlMessageMapping {
  [ControlType.Close]: CloseControlMessage;
  [ControlType.Hide]: HideControlMessage;
  [ControlType.Minimize]: MinimizeControlMessage;
  [ControlType.Move]: MoveControlMessage;
  [ControlType.Resize]: ResizeControlMessage;
  [ControlType.Show]: ShowControlMessage;
  [ControlType.ToggleMaximize]: ToggleMaximizeControlMessage;
}

export const sendControlAction = <T extends keyof ControlMessageMapping>(message: ControlMessageMapping[T]) => {
  ipcRenderer.send(controlApiKey, message);
};
