import { BaseWindow } from 'service/entities/WindowService/windows/BaseWindow';

/**
 * @deprecated
 */
export const initWindowDestroyInterval = (baseWindow: BaseWindow) =>
  setInterval(
    () => {
      baseWindow.destroy();
    },
    1000 * 60 * 30,
  );
