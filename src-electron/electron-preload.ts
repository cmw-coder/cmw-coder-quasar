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
  HideControlMessage,
  MinimizeControlMessage,
  MoveControlMessage,
  sendControlAction,
  ShowControlMessage,
  ToggleMaximizeControlMessage,
} from 'preload/types/ControlApi';

import { ACTION_API_KEY, CONTROL_API_KEY } from 'shared/constants/common';
import { ActionMessage } from 'shared/types/ActionMessage';
import { SERVICE_CALL_KEY, ServiceType } from 'shared/types/service';
import { WindowType } from 'shared/types/service/WindowServiceTrait/types';

contextBridge.exposeInMainWorld(ACTION_API_KEY, {
  register: registerAction,
  send: sendToMain,
  service: <T extends ServiceType>(
    serviceName: T,
    functionName: string | symbol,
    ...args: never[]
  ) => invokeToMain(SERVICE_CALL_KEY, serviceName, functionName, ...args),
  unregister: unregisterAction,
});
contextBridge.exposeInMainWorld(CONTROL_API_KEY, {
  close: (windowType: WindowType) =>
    sendControlAction(new CloseControlMessage(windowType)),
  hide: (windowType: WindowType) =>
    sendControlAction(new HideControlMessage(windowType)),
  minimize: (windowType: WindowType) =>
    sendControlAction(new MinimizeControlMessage(windowType)),
  move: (position: { x?: number; y?: number }, windowType: WindowType) =>
    sendControlAction(new MoveControlMessage(position, windowType)),
  show: (windowType: WindowType) =>
    sendControlAction(new ShowControlMessage(windowType)),
  toggleMaximize: () => sendControlAction(new ToggleMaximizeControlMessage()),
});

ipcRenderer.on(ACTION_API_KEY, (_, message: ActionMessage) =>
  triggerAction(message.type, message.data),
);

webFrame.setZoomFactor(1);
webFrame.setVisualZoomLevelLimits(0, 0);
