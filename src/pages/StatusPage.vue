<script setup lang="ts">
import { colors, useQuasar } from 'quasar';
import { onBeforeUnmount, onMounted, ref } from 'vue';

import { ActionType } from 'shared/types/ActionMessage';
import { CompletionStatus, CompletionStatusData } from 'shared/types/common';
import { ServiceType } from 'shared/types/service';
import { DEFAULT_APP_DATA } from 'shared/types/service/DataServiceTrait/constants';
import { WindowType } from 'shared/types/service/WindowServiceTrait/types';

import { ActionApi } from 'types/ActionApi';
import { i18nSubPath, useService } from 'utils/common';

const baseName = 'pages.StatusPage';

const { changeAlpha, getPaletteColor } = colors;

const colorMap = {
  [CompletionStatus.Standby]: 'transparent',
  [CompletionStatus.Prompting]: changeAlpha(
    getPaletteColor('orange') ?? '',
    0.7,
  ),
  [CompletionStatus.Requesting]: changeAlpha(
    getPaletteColor('primary') ?? '',
    0.7,
  ),
  [CompletionStatus.Empty]: changeAlpha(getPaletteColor('purple') ?? '', 0.7),
  [CompletionStatus.Failed]: changeAlpha(
    getPaletteColor('negative') ?? '',
    0.7,
  ),
};
const defaultWidth = DEFAULT_APP_DATA.window[WindowType.Status].width ?? 200;
const defaultHeight = DEFAULT_APP_DATA.window[WindowType.Status].height ?? 32;

const { dark } = useQuasar();
const windowService = useService(ServiceType.WINDOW);
const actionApi = new ActionApi(baseName);

const statusData = ref<CompletionStatusData>({
  status: CompletionStatus.Standby,
  detail: 'I AM READY FOR GENERATING CODE',
});

const i18n = i18nSubPath(baseName);

onMounted(() => {
  actionApi.register(ActionType.UpdateStatus, async (data) => {
    console.log('UpdateStatus', data);
    statusData.value = data;
    if (statusData.value.status === CompletionStatus.Failed) {
      await windowService.setWindowSize(
        {
          width: defaultWidth,
          height: 80 + statusData.value.detail.split('\n').length * 32,
        },
        WindowType.Status,
      );
    } else {
      await windowService.setWindowSize(
        {
          width: defaultWidth,
          height: defaultHeight,
        },
        WindowType.Status,
      );
    }
  });
});

onBeforeUnmount(() => {
  actionApi.unregister();
});
</script>

<template>
  <q-page class="column q-gutter-y-xs" :style="{ maxWidth: defaultWidth }">
    <q-bar
      class="q-electron-drag rounded-borders"
      :style="{
        backgroundColor: dark.isActive
          ? 'rgba(127,127,127,0.7)'
          : 'rgba(255,255,255,0.5)',
        borderColor: colorMap[statusData.status],
      }"
      style="border-width: 2px; border-style: solid"
    >
      <q-img
        v-if="statusData.status == CompletionStatus.Standby"
        :src="`logos/${dark.isActive ? 'light' : 'dark'}/logo.svg`"
        width="1.5rem"
      />
      <q-spinner-rings
        v-else-if="statusData.status === CompletionStatus.Prompting"
        color="orange"
        size="1.5rem"
      />
      <q-spinner-grid
        v-else-if="statusData.status === CompletionStatus.Requesting"
        color="primary"
        size="1.5rem"
      />
      <q-icon
        v-else-if="statusData.status === CompletionStatus.Empty"
        color="purple"
        name="mdi-text-box-check-outline"
        size="1.5rem"
      />
      <q-icon v-else color="negative" name="warning" size="1.5rem" />
      <div
        class="col text-center"
        :class="dark.isActive ? 'text-white' : 'text-black'"
      >
        {{ i18n(`labels.${statusData.status}`) }}
      </div>
    </q-bar>
    <q-card
      v-if="statusData.status === CompletionStatus.Failed"
      bordered
      flat
      :style="{
        backgroundColor: dark.isActive
          ? 'rgba(127,127,127,0.7)'
          : 'rgba(255,255,255,0.5)',
        borderColor: colorMap[statusData.status],
      }"
      style="border-width: 2px; border-style: solid"
    >
      <q-card-section>
        <div :class="dark.isActive ? 'text-white' : 'text-black'">
          {{ statusData.detail }}
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<style lang="scss">
body.body--dark {
  background-color: transparent;
}
</style>
