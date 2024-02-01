<script lang="ts" setup>
import { useSettingsStore } from 'stores/settings';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { WindowType } from 'shared/types/WindowType';

const { toggleDarkMode } = useSettingsStore();
const { theme } = storeToRefs(useSettingsStore());

const { t } = useI18n();
const i18n = (relativePath: string) => {
  return t('components.DarkModeButton.' + relativePath);
};

const switchDarkMode = () => {
  toggleDarkMode();
  window.controlApi.reload(WindowType.Immersive);
  window.controlApi.reload(WindowType.Floating);
};
</script>

<template>
  <q-btn
    :icon="theme.icon"
    :text-color="theme.color"
    flat
    round
    @click="switchDarkMode"
  >
    <q-tooltip
      anchor="center right"
      self="center left"
      transition-hide="jump-left"
      transition-show="jump-right"
    >
      {{ i18n('labels.toggleDarkMode') }}
    </q-tooltip>
  </q-btn>
</template>

<style scoped></style>
