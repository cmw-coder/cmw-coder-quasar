/* eslint-disable */

declare namespace NodeJS {
  interface ProcessEnv {
    APP_URL: string;
    QUASAR_PUBLIC_FOLDER: string;
    QUASAR_ELECTRON_PRELOAD: string;
    PROD: 'true' | 'false';
  }
}
