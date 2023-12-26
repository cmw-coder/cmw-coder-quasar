<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import DarkModeButton from 'components/DarkModeButton.vue';
import { WindowType } from 'shared/types/WindowType';

const { t } = useI18n();
const { matched } = useRoute();

const i18n = (relativePath: string) => {
  return t('layouts.headers.MainHeader.' + relativePath);
};

const { name } = matched[matched.length - 2];

const emit = defineEmits(['toggle:left-drawer', 'toggle:right-drawer']);

const hide = () => window.controlApi.hide(<WindowType>name);

const minimize = () => window.controlApi.minimize(<WindowType>name);

const toggleLeftDrawer = () => emit('toggle:left-drawer', true);

const toggleMaximize = () => window.controlApi.toggleMaximize();

const toggleRightDrawer = () => emit('toggle:right-drawer', true);
</script>

<template>
  <q-header bordered class="bg-primary text-white">
    <q-bar v-if="$q.platform.is.electron" class="q-electron-drag q-pr-none">
      <q-icon name="laptop_chromebook" />
      <div>{{ i18n('labels.title') }}</div>
      <q-space />
      <q-btn flat icon="mdi-minus" stretch @click="minimize" />
      <q-btn flat icon="crop_square" stretch @click="toggleMaximize" />
      <q-btn
        class="close-button"
        flat
        icon="mdi-window-close"
        stretch
        @click="hide"
      />
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

<style lang="scss" scoped>
@import 'css/quasar.variables';

.close-button {
  transition: background-color 0.3s ease;

  &:hover {
    background-color: $negative;
  }
}
</style>
