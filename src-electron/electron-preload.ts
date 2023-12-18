import { contextBridge } from 'electron';

import {
  controlApiKey,
  ControlType,
  sendControlAction,
} from 'shared/types/ControlApi';
import {
  actionApiKey,
  receive,
  send,
} from 'shared/types/ActionApi';

contextBridge.exposeInMainWorld(
  controlApiKey,
  Object.fromEntries(
    Object.values(ControlType).map((controlType) => {
      return [controlType, sendControlAction];
    })
  )
);

// contextBridge.exposeInMainWorld(controlApiKey, {
//   close() {
//     sendControlAction(new CloseControlMessage());
//   },
//   minimize(windowType: WindowType) {
//     sendControlAction(new MinimizeControlMessage(windowType));
//   },
//   toggleMaximize() {
//     sendControlAction(new ToggleMaximizeControlMessage());
//   },
// });

contextBridge.exposeInMainWorld(actionApiKey, { receive, send });
