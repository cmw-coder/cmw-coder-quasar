import enUS from './en-US';
import zhCN from './zh-CN';

export const messages = {
  'en-US': enUS,
  'zh-CN': zhCN,
};

export type AvailableLocales = keyof typeof messages;
