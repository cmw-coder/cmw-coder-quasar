<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import DarkModeButton from 'components/DarkModeButton.vue';
import { WindowType } from 'shared/types/ControlApi';

const { t } = useI18n();
const i18n = (relativePath: string) => {
  return t('layouts.headers.MainHeader.' + relativePath);
};

const emit = defineEmits(['toggle:left-drawer', 'toggle:right-drawer']);

const closeApp = () => {
  window.controlApi.Close(undefined);
};

const minimize = () => {
  window.controlApi.minimize(WindowType.Main);
};
const toggleLeftDrawer = () => {
  emit('toggle:left-drawer', true);
};

const toggleMaximize = () => {
  window.controlApi.toggleMaximize();
};

const toggleRightDrawer = () => {
  emit('toggle:right-drawer', true);
};
</script>

<template>
  <q-header bordered class="bg-primary text-white">
    <q-bar v-if="$q.platform.is.electron" class="q-electron-drag">
      <q-icon name="laptop_chromebook" />
      <div>{{ i18n('labels.title') }}</div>
      <q-space />
      <q-btn dense flat icon="minimize" @click="minimize" />
      <q-btn dense flat icon="crop_square" @click="toggleMaximize" />
      <q-btn dense flat icon="close" @click="closeApp" />
    </q-bar>
    <q-toolbar>
      <q-btn dense flat icon="menu" round @click="toggleLeftDrawer" />
      <q-toolbar-title>
        <q-avatar>
          <!--          <q-img src="~assets/svg/logo-simple-light.svg" />-->
        </q-avatar>
      </q-toolbar-title>
      <dark-mode-button />
      <q-btn dense flat icon="menu" round @click="toggleRightDrawer" />
    </q-toolbar>
  </q-header>
</template>

<style scoped></style>
