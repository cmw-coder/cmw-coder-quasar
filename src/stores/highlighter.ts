import { defineStore } from 'pinia';
import { Dark } from 'quasar';
import { BundledLanguage, BundledTheme } from 'shiki';
import { reactive } from 'vue';

import { highlighter } from 'boot/extension';

interface Config {
  langs: BundledLanguage[];
  theme: {
    dark: BundledTheme;
    light: BundledTheme;
  };
}

export const useHighlighter = defineStore('highlighter', () => {
  const config: Config = reactive({
    langs: [],
    theme: {
      dark: 'dark-plus',
      light: 'light-plus',
    },
  });

  const codeToHtml = (code: string, lang: BundledLanguage) => {
    if (!code.length) {
      return '';
    }
    return highlighter.codeToHtml(code, {
      lang,
      theme: Dark.isActive ? config.theme.dark : config.theme.light,
      // colorReplacements: { 'editor-background': 'transparent' },
    });
  };

  const initialize = async () => {
    const loadPromises = new Array<Promise<void>>();

    const loadedThemes = highlighter.getLoadedThemes();
    if (!loadedThemes.includes(config.theme.dark)) {
      loadPromises.push(highlighter.loadTheme(config.theme.dark));
    }
    if (!loadedThemes.includes(config.theme.light)) {
      loadPromises.push(highlighter.loadTheme(config.theme.light));
    }

    const loadedLangs = highlighter.getLoadedLanguages();
    for (const lang of config.langs) {
      if (!loadedLangs.includes(lang)) {
        loadPromises.push(highlighter.loadLanguage(lang));
      }
    }

    await Promise.all(loadPromises);
  };

  return {
    config,
    codeToHtml,
    initialize,
  };
});
