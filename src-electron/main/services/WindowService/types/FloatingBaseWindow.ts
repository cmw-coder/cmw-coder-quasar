import { WindowType } from 'shared/types/WindowType';
import {
  BaseWindow,
  windowOptions,
} from 'main/services/WindowService/types/BaseWindow';

export class FloatingBaseWindow extends BaseWindow {
  constructor(type: WindowType, options?: windowOptions) {
    super(type, options);
  }
}
