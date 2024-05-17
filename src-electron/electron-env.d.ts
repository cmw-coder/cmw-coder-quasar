/* eslint-disable */

declare namespace NodeJS {
  // noinspection JSUnusedGlobalSymbols
  interface ProcessEnv {
    APPDATA: string;
    APP_URL: string;
    QUASAR_PUBLIC_FOLDER: string;
    QUASAR_ELECTRON_PRELOAD: string;
    PROD: 'true' | 'false';
  }
}
