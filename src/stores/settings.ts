import { defineStore } from 'pinia';
import { AddressbarColor, colors, Dark, Screen } from 'quasar';
import { computed, ref } from 'vue';

const { getPaletteColor } = colors;

export interface Theme {
  color: string;
  darkMode: boolean | 'auto';
  icon: string;
  name: string;
}

export const darkModes: Record<string, Theme> = {
  auto: {
    color: 'teal',
    darkMode: 'auto',
    icon: 'hdr_auto',
    name: 'auto',
  },
  true: {
    color: 'yellow',
    darkMode: true,
    icon: 'dark_mode',
    name: 'dark',
  },
  false: {
    color: 'orange',
    darkMode: false,
    icon: 'light_mode',
    name: 'light',
  },
};

export const useSettingsStore = defineStore('settings', () => {
  const theme = ref<Theme>(darkModes[Dark.mode.toString()]);
  const developerMode = ref(false);
  const isMobile = computed(() => Screen.lt.md);

  const applyDarkMode = () => {
    Dark.set(theme.value.darkMode);
    AddressbarColor.set(
      Dark.isActive ? getPaletteColor('grey-10') : getPaletteColor('grey-2')
    );
  };

  const toggleDarkMode = () => {
    const keys = Object.keys(darkModes);
    const index = keys.indexOf(theme.value.darkMode.toString());
    theme.value = darkModes[keys[(index + 1) % keys.length]];
    applyDarkMode();
  };

  return {
    theme,
    developerMode,
    isMobile,
    applyDarkMode,
    toggleDarkMode,
  };
});
