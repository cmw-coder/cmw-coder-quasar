<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { bus } from 'boot/bus';
import { ServiceType } from 'shared/types/service';
import { WindowType } from 'shared/types/WindowType';
import { useService } from 'utils/common';

interface Props {
  leftDrawer?: {
    icon?: string;
    label?: string;
  };
  rightDrawer?: {
    icon?: string;
    label?: string;
  };
  title?: {
    src?: string;
    label?: string;
  };
  windowType: WindowType;
}

const props = withDefaults(defineProps<Props>(), {
  leftDrawer: () => ({ icon: 'menu' }),
});

const { t } = useI18n();
const windowService = useService(ServiceType.WINDOW);

const i18n = (relativePath: string) => {
  return t('layouts.headers.MainHeader.' + relativePath);
};

const isFixed = ref(false);

const defaultSize = () => {
  windowService.defaultWindowSize(props.windowType);
};

const hide = () => {
  if (props.windowType === WindowType.Main) {
    windowService.hideWindow(props.windowType);
  } else {
    windowService.closeWindow(props.windowType);
  }
};

const minimize = () => {
  windowService.minimizeWindow(props.windowType);
};

const toggleMaximize = () => {
  windowService.toggleMaximizeWindow(props.windowType);
};

const bodyMouseInHandler = () => {
  windowService.mouseMoveInOrOutWindow(props.windowType);
};

const bodyMouseOutHandler = () => {
  windowService.mouseMoveInOrOutWindow(props.windowType);
};

const toggleFixed = async () => {
  await windowService.toggleWindowFixed(props.windowType);
  isFixed.value = await windowService.getWindowIsFixed(props.windowType);
};

onMounted(async () => {
  console.log('MainHeader mounted', props.windowType);
  document.body.addEventListener('mouseenter', bodyMouseInHandler);
  document.body.addEventListener('mouseleave', bodyMouseOutHandler);
  isFixed.value = await windowService.getWindowIsFixed(props.windowType);
});

onBeforeUnmount(() => {
  document.body.removeEventListener('mouseenter', bodyMouseInHandler);
  document.body.removeEventListener('mouseleave', bodyMouseInHandler);
});
</script>

<template>
  <q-header elevated class="bg-primary text-white">
    <q-bar v-if="$q.platform.is.electron" class="q-electron-drag q-pr-none">
      <q-icon name="mdi-assistant" />
      <div>{{ i18n('labels.title') }}</div>
      <q-space />
      <q-btn flat icon="mdi-resize" stretch @click="defaultSize">
        <q-tooltip :delay="1000">
          {{ i18n('tooltips.defaultSize') }}
        </q-tooltip>
      </q-btn>

      <q-btn
        flat
        :icon="isFixed ? 'mdi-pin' : 'mdi-pin-off'"
        stretch
        @click="() => toggleFixed()"
      >
        <q-tooltip :delay="1000">
          {{ isFixed ? i18n('tooltips.fix') : i18n('tooltips.unfix') }}
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
        v-if="leftDrawer?.icon || leftDrawer?.label"
        dense
        flat
        :icon="leftDrawer?.icon"
        :label="leftDrawer?.label"
        :round="(leftDrawer?.icon && !leftDrawer?.label) === true"
        @click="bus.emit('drawer', 'toggle', 'left')"
      />
      <q-toolbar-title>
        <q-avatar v-if="title?.src">
          <q-img :src="title.src" />
        </q-avatar>
        <template v-if="title?.label">
          {{ i18n(`toolbar.title.${title.label}`) }}
        </template>
      </q-toolbar-title>
      <q-btn
        v-if="rightDrawer?.icon || rightDrawer?.label"
        dense
        flat
        no-caps
        :icon-right="rightDrawer?.icon"
        :label="
          rightDrawer.label
            ? i18n(`toolbar.rightDrawer.${rightDrawer.label}`)
            : undefined
        "
        :round="(rightDrawer?.icon && !rightDrawer?.label) === true"
        @click="bus.emit('drawer', 'toggle', 'right')"
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
