<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import { bus } from 'boot/bus';
import { WindowType } from 'shared/types/WindowType';

const { t } = useI18n();
const { matched } = useRoute();

const i18n = (relativePath: string) => {
  return t('layouts.headers.MainHeader.' + relativePath);
};

const { name } = matched[matched.length - 2];

const defaultSize = () => window.controlApi.resize({}, <WindowType>name);

const hide = () => window.controlApi.hide(<WindowType>name);

const minimize = () => window.controlApi.minimize(<WindowType>name);

const toggleMaximize = () => window.controlApi.toggleMaximize();
</script>

<template>
  <q-header bordered class="bg-primary text-white">
    <q-bar v-if="$q.platform.is.electron" class="q-electron-drag q-pr-none">
      <q-icon name="mdi-assistant" />
      <div>{{ i18n('labels.title') }}</div>
      <q-space />
      <q-btn flat icon="mdi-resize" stretch @click="defaultSize">
        <q-tooltip :delay="1000">
          {{ i18n('tooltips.defaultSize') }}
        </q-tooltip>
      </q-btn>
      <q-btn flat icon="mdi-minus" stretch @click="minimize">
        <q-tooltip :delay="1000">
          {{ i18n('tooltips.minimize') }}
        </q-tooltip>
      </q-btn>
      <q-btn flat icon="crop_square" stretch @click="toggleMaximize">
        <q-tooltip :delay="1000">
          {{ i18n('tooltips.toggleMaximize') }}
        </q-tooltip>
      </q-btn>
      <q-btn
        class="close-button"
        flat
        icon="mdi-window-close"
        stretch
        @click="hide"
      >
        <q-tooltip :delay="1000">
          {{ i18n('tooltips.close') }}
        </q-tooltip>
      </q-btn>
    </q-bar>
    <q-toolbar>
      <q-btn
        dense
        flat
        icon="menu"
        round
        @click="bus.emit('drawer', 'left', 'toggle')"
      />
      <q-toolbar-title>
        <q-avatar>
          <!--          <q-img src="~assets/svg/logo-simple-light.svg" />-->
        </q-avatar>
      </q-toolbar-title>
      <q-btn
        dense
        flat
        icon="menu"
        round
        @click="bus.emit('drawer', 'right', 'toggle')"
      />
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
