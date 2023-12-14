import { defineStore } from 'pinia';
import { Dark } from 'quasar';
import { Lang, renderToHtml, Theme } from 'shiki';
import { computed, reactive } from 'vue';

import { highlighter } from 'boot/extension';

interface Config {
  langs: Lang[];
  theme: {
    dark: Theme;
    light: Theme;
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

  const backgroundColor = computed(() =>
    highlighter.getBackgroundColor(
      Dark.isActive ? config.theme.dark : config.theme.light
    )
  );

  const codeToHtml = (code: string, lang: Lang) => {
    if (!code.length) {
      return '';
    }
    return renderToHtml(
      highlighter.codeToThemedTokens(
        code,
        lang,
        Dark.isActive ? config.theme.dark : config.theme.light
      ),
      {
        bg: 'transparent',
      }
    );
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
    backgroundColor,
    config,
    codeToHtml,
    initialize,
  };
});
