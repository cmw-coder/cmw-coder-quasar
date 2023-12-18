import { contextBridge, ipcRenderer } from 'electron';

import {
  ActionMessage,
  registerActionCallback,
  sendToMain,
  triggerActionCallback,
} from 'preload/types/ActionApi';
import {
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
  hide: (windowType: WindowType) =>
    sendControlAction(new HideControlMessage(windowType)),
  minimize: (windowType: WindowType) =>
    sendControlAction(new MinimizeControlMessage(windowType)),
  move: (position: { x?: number; y?: number }, windowType: WindowType) =>
    sendControlAction(new MoveControlMessage(position, windowType)),
  resize: (size: { width?: number; height?: number }, windowType: WindowType) =>
    sendControlAction(new ResizeControlMessage(size, windowType)),
  show: (windowType: WindowType) =>
    sendControlAction(new ShowControlMessage(windowType)),
  toggleMaximize: () => sendControlAction(new ToggleMaximizeControlMessage()),
});

contextBridge.exposeInMainWorld(actionApiKey, {
  receive: registerActionCallback,
  send: sendToMain,
});
ipcRenderer.on(actionApiKey, (_, message: ActionMessage) =>
  triggerActionCallback(message.type, message.data)
);
