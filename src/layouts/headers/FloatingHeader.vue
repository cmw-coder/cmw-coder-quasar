<script setup lang="ts">
import { useQuasar } from 'quasar';
import { PropType, onBeforeUnmount, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

import { ServiceType } from 'shared/types/service';
import { WindowType } from 'shared/types/service/WindowServiceTrait/types';

import { useService } from 'utils/common';

type ControlType = 'defaultSize' | 'minimize' | 'toggleMaximize' | 'close';

const props = defineProps({
  windowType: {
    type: String as PropType<WindowType>,
    required: true,
  },
  controlList: {
    type: Array as PropType<ControlType[]>,
    default: () => ['defaultSize', 'minimize', 'toggleMaximize', 'close'],
  },
});

const windowService = useService(ServiceType.WINDOW);

const defaultSize = () => {
  windowService.defaultWindowSize(props.windowType);
};

const hide = () => {
  windowService.closeWindow(props.windowType);
};

const minimize = () => {
  windowService.minimizeWindow(props.windowType);
};

const toggleMaximize = () => {
  windowService.toggleMaximizeWindow(props.windowType);
};

const { t } = useI18n();
const { platform } = useQuasar();

const i18n = (relativePath: string) => {
  return t('layouts.headers.FloatingHeader.' + relativePath);
};

const bodyMouseInHandler = () => {
  windowService.mouseMoveInOrOutWindow(props.windowType);
};

const bodyMouseOutHandler = () => {
  windowService.mouseMoveInOrOutWindow(props.windowType);
};

onMounted(() => {
  console.log('FloatingHeader mounted', props.windowType);
  document.body.addEventListener('mouseenter', bodyMouseInHandler);
  document.body.addEventListener('mouseleave', bodyMouseOutHandler);
});

onBeforeUnmount(() => {
  document.body.removeEventListener('mouseenter', bodyMouseInHandler);
  document.body.removeEventListener('mouseleave', bodyMouseInHandler);
});
</script>

<template>
  <q-header bordered class="bg-primary text-white">
    <q-bar v-if="platform.is.electron" class="q-electron-drag">
      <q-icon name="mdi-assistant" />
      <div>{{ i18n('labels.title') }}</div>
      <q-space />
      <q-btn
        v-if="controlList.includes('defaultSize')"
        flat
        icon="mdi-resize"
        stretch
        @click="defaultSize"
      >
        <q-tooltip :delay="1000">
          {{ i18n('tooltips.defaultSize') }}
        </q-tooltip>
      </q-btn>
      <q-btn
        v-if="controlList.includes('minimize')"
        flat
        icon="mdi-minus"
        stretch
        @click="minimize"
      >
        <q-tooltip :delay="1000">
          {{ i18n('tooltips.minimize') }}
        </q-tooltip>
      </q-btn>
      <q-btn
        v-if="controlList.includes('toggleMaximize')"
        flat
        icon="crop_square"
        stretch
        @click="toggleMaximize"
      >
        <q-tooltip :delay="1000">
          {{ i18n('tooltips.toggleMaximize') }}
        </q-tooltip>
      </q-btn>
      <q-btn
        v-if="controlList.includes('close')"
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
  </q-header>
</template>

<style lang="scss" scoped></style>
