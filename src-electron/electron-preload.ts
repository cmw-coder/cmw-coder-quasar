import { contextBridge } from 'electron';

import { receive, send } from 'preload/types/ActionApi';
import {
  CloseControlMessage,
  ControlType,
  HideControlMessage,
  MinimizeControlMessage,
  MoveControlMessage,
  ResizeControlMessage,
  sendControlAction,
  ShowControlMessage,
  ToggleMaximizeControlMessage,
} from 'preload/types/ControlApi';
import { actionApiKey, controlApiKey } from 'shared/types/constants';
import { WindowType } from 'shared/types/WindowType';

contextBridge.exposeInMainWorld(controlApiKey, {
  [ControlType.Close]: () => sendControlAction(new CloseControlMessage()),
  [ControlType.Hide]: (windowType: WindowType) =>
    sendControlAction(new HideControlMessage(windowType)),
  [ControlType.Minimize]: (windowType: WindowType) =>
    sendControlAction(new MinimizeControlMessage(windowType)),
  [ControlType.Move]: (
    position: { x?: number; y?: number },
    windowType: WindowType
  ) => sendControlAction(new MoveControlMessage(position, windowType)),
  [ControlType.Resize]: (
    size: { width?: number; height?: number },
    windowType: WindowType
  ) => sendControlAction(new ResizeControlMessage(size, windowType)),
  [ControlType.Show]: (windowType: WindowType) =>
    sendControlAction(new ShowControlMessage(windowType)),
  [ControlType.ToggleMaximize]: () =>
    sendControlAction(new ToggleMaximizeControlMessage()),
});

contextBridge.exposeInMainWorld(actionApiKey, { receive, send });
