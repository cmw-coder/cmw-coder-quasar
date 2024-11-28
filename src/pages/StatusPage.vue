<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { ActionApi } from 'types/ActionApi';
import { ActionType } from 'shared/types/ActionMessage';
import {
  Status,
  StatusData,
} from 'shared/types/service/WindowServiceTrait/StatusWindowType';
import { useQuasar } from 'quasar';

const baseName = 'pages.StatusPage.';
const colorMap = {
  [Status.READY]: 'transparent',
  [Status.GENERATING]: 'rgba(25, 118, 210, 0.5)',
  [Status.ERROR]: 'rgba(193, 0, 21, 0.5)',
};

const { t } = useI18n();
const { dark } = useQuasar();
const actionApi = new ActionApi(baseName);

const i18n = (relativePath: string) => {
  return t(baseName + relativePath);
};

const statusData = ref<StatusData>({
  status: Status.READY,
  detail: 'I AM READY FOR GENERATING CODE',
});

onMounted(() => {
  actionApi.register(ActionType.UpdateStatus, (data) => {
    console.log('UpdateStatus', data);
    statusData.value = data;
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
