import { contextBridge, ipcRenderer, webFrame } from 'electron';

import {
  invokeToMain,
  registerAction,
  sendToMain,
  triggerAction,
  unregisterAction,
} from 'preload/types/ActionApi';
import {
  CloseControlMessage,
  DevToolsControlMessage,
  HideControlMessage,
  MinimizeControlMessage,
  MoveControlMessage,
  ReloadControlMessage,
  ResizeControlMessage,
  sendControlAction,
  ShowControlMessage,
  ToggleMaximizeControlMessage,
} from 'preload/types/ControlApi';
import { ActionMessage } from 'shared/types/ActionMessage';
import { actionApiKey, controlApiKey } from 'shared/types/constants';
import { WindowType } from 'shared/types/WindowType';

contextBridge.exposeInMainWorld(controlApiKey, {
  close: (windowType: WindowType) =>
    sendControlAction(new CloseControlMessage(windowType)),
  devTools: (windowType: WindowType) =>
    sendControlAction(new DevToolsControlMessage(windowType)),
  hide: (windowType: WindowType) =>
    sendControlAction(new HideControlMessage(windowType)),
  minimize: (windowType: WindowType) =>
    sendControlAction(new MinimizeControlMessage(windowType)),
  move: (position: { x?: number; y?: number }, windowType: WindowType) =>
    sendControlAction(new MoveControlMessage(position, windowType)),
  reload: (windowType: WindowType) =>
    sendControlAction(new ReloadControlMessage(windowType)),
  resize: (size: { width?: number; height?: number }, windowType: WindowType) =>
    sendControlAction(new ResizeControlMessage(size, windowType)),
  show: (windowType: WindowType) =>
    sendControlAction(new ShowControlMessage(windowType)),
  toggleMaximize: () => sendControlAction(new ToggleMaximizeControlMessage()),
});

contextBridge.exposeInMainWorld(actionApiKey, {
  invoke: invokeToMain,
  register: registerAction,
  send: sendToMain,
  unregister: unregisterAction,
});

ipcRenderer.on(actionApiKey, (_, message: ActionMessage) =>
  triggerAction(message.type, message.data)
);

webFrame.setZoomFactor(1);
webFrame.setVisualZoomLevelLimits(0, 0);
