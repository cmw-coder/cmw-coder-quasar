import { AxiosError } from 'axios';
import { QNotifyCreateOptions } from 'quasar';

import { authCode } from 'boot/axios';

/**
 * @deprecated
 */
export const sendAuthCode = async (
  userId: string,
  i18n: (relativePath: string) => string,
): Promise<QNotifyCreateOptions> => {
  try {
    await authCode(userId);
    return {
      type: 'positive',
    };
  } catch (e) {
    const error = <AxiosError>e;
    if (error.response?.status === 400) {
      return {
        type: 'warning',
        message: i18n('notifications.codeFailed'),
        caption: (<{ message: string }>error.response.data).message,
      };
    } else {
      return {
        type: 'negative',
        message: i18n('notifications.codeFailed'),
        caption: i18n('notifications.networkCaption'),
      };
    }
  }
};
