import { BaseWindow } from 'main/types/BaseWindow';

export const initWindowDestroyInterval = (baseWindow: BaseWindow) =>
  setInterval(
    () => {
      baseWindow.destroy();
    },
    1000 * 60 * 30,
  );
