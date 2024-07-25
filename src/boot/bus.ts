import { EventBus } from 'quasar';
import { boot } from 'quasar/wrappers';

import { ReviewData } from 'shared/types/review';

export const bus = new EventBus<{
  drawer: (
    action: 'close' | 'open' | 'toggle',
    position: 'left' | 'right',
  ) => void;
  review: (data: ReviewData) => void;
}>();

// noinspection JSUnusedGlobalSymbols
export default boot(({ app }) => {
  app.config.globalProperties.$bus = bus;
});
