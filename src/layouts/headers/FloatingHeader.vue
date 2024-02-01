<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';

const { t } = useI18n();
const { platform } = useQuasar();

const i18n = (relativePath: string) => {
  return t('layouts.headers.FloatingHeader.' + relativePath);
};
</script>

<template>
  <q-header bordered class="bg-primary text-white">
    <q-bar v-if="platform.is.electron" class="q-electron-drag">
      <q-icon name="mdi-assistant" />
      <div>{{ i18n('labels.title') }}</div>
      <q-space />
    </q-bar>
  </q-header>
</template>

<style lang="scss" scoped></style>
