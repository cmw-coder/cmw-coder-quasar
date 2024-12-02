import { boot } from 'quasar/wrappers';
import { createI18n } from 'vue-i18n';

import messages from 'src/i18n';

// noinspection JSUnusedGlobalSymbols
export type MessageLanguages = keyof typeof messages;
// Type-define 'en-US' as the primary schema for the resource
export type MessageSchema = (typeof messages)['en-US'];

// See https://vue-i18n.intlify.dev/guide/advanced/typescript.html#global-resource-schema-type-definition
declare module 'vue-i18n' {
  // noinspection JSUnusedGlobalSymbols
  export interface DefineLocaleMessage extends MessageSchema {}

  // noinspection JSUnusedGlobalSymbols
  export interface DefineDateTimeFormat {}

  // noinspection JSUnusedGlobalSymbols
  export interface DefineNumberFormat {}
}

const i18n = createI18n({
  locale: 'en-US',
  legacy: false,
  messages,
});

export const globalI18n = i18n.global;

// noinspection JSUnusedGlobalSymbols
export default boot(({ app }) => {
  app.use(i18n);
});
