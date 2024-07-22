<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { bus } from 'boot/bus';
import { WindowType } from 'shared/types/WindowType';
import { useService } from 'utils/common';
import { ServiceType } from 'shared/types/service';
import { PropType, onBeforeUnmount, onMounted, ref } from 'vue';

const props = defineProps({
  windowType: {
    type: String as PropType<WindowType>,
    required: true,
  },
});

const { t } = useI18n();

const i18n = (relativePath: string) => {
  return t('layouts.headers.MainHeader.' + relativePath);
};

const isFixed = ref(false);

const windowService = useService(ServiceType.WINDOW);

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
  windowService.toggleWindowFixed(props.windowType);
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
        dense
        flat
        icon="menu"
        round
        @click="bus.emit('drawer', 'toggle', 'left')"
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
