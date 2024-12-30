import {
  BaseWindow,
  windowOptions,
} from 'main/services/WindowService/types/BaseWindow';

import { WindowType } from 'shared/types/service/WindowServiceTrait/types';

export class FloatingBaseWindow extends BaseWindow {
  constructor(type: WindowType, options?: windowOptions) {
    super(type, options);
  }
}
