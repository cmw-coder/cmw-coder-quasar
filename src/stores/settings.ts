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

export const themes = [
  {
    color: 'teal',
    darkMode: 'auto',
    icon: 'hdr_auto',
    name: 'auto',
  },
  {
    color: 'yellow',
    darkMode: true,
    icon: 'dark_mode',
    name: 'dark',
  },
  {
    color: 'orange',
    darkMode: false,
    icon: 'light_mode',
    name: 'light',
  },
] as const;

export const useSettingsStore = defineStore('settings', () => {
  const theme = ref<Theme>(
    themes.find((theme) => theme.darkMode === Dark.mode) ?? themes[0],
  );
  const developerMode = ref(false);
  const isMobile = computed(() => Screen.lt.md);

  const applyDarkMode = () => {
    Dark.set(theme.value.darkMode);
    AddressbarColor.set(
      Dark.isActive ? getPaletteColor('grey-10') : getPaletteColor('grey-2'),
    );
  };

  const toggleDarkMode = () => {
    const index = themes.findIndex(
      (item) => item.darkMode === theme.value.darkMode,
    );
    theme.value = themes[(index + 1) % themes.length];
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
