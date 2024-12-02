<script setup lang="ts">
import { useQuasar } from 'quasar';
import { onBeforeUnmount, onMounted, ref } from 'vue';

import { ActionType } from 'shared/types/ActionMessage';
import { ServiceType } from 'shared/types/service';
import { Status, StatusData } from 'shared/types/service/WindowServiceTrait/StatusWindowType';
import { ActionApi } from 'types/ActionApi';
import { i18nSubPath, useService } from 'utils/common';
import { WindowType } from 'shared/types/WindowType';

const baseName = 'pages.StatusPage.';
const colorMap = {
  [Status.READY]: 'transparent',
  [Status.GENERATING]: 'rgba(25, 118, 210, 0.5)',
  [Status.ERROR]: 'rgba(193, 0, 21, 0.5)',
};

const { dark } = useQuasar();
const windowService = useService(ServiceType.WINDOW);
const actionApi = new ActionApi(baseName);

const statusData = ref<StatusData>({
  status: Status.READY,
  detail: 'I AM READY FOR GENERATING CODE',
});

const i18n = i18nSubPath(baseName);

onMounted(() => {
  actionApi.register(ActionType.UpdateStatus, async (data) => {
    console.log('UpdateStatus', data);
    statusData.value = data;
    if (statusData.value.status === Status.ERROR) {
      await windowService.setWindowSize(
        {
          width: 200,
          height: 32 + statusData.value.detail.split('\n').length * 16
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
  <q-bar
    class="q-electron-drag rounded-borders"
    :style="{
      backgroundColor: dark.isActive
        ? 'rgba(127,127,127,0.7)'
        : 'rgba(127,127,127,0.3)',
      borderColor: colorMap[statusData.status],
    }"
    style="border-width: 2px; border-style: solid"
  >
    <q-img
      v-if="statusData.status == Status.READY"
      :src="`logos/${dark.isActive ? 'light' : 'dark'}/logo.svg`"
      width="1.5rem"
    />
    <q-spinner-rings
      v-else-if="statusData.status === Status.GENERATING"
      color="primary"
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
</template>

<style scoped lang="scss"></style>
