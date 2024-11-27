<script setup lang="ts">
import {
  Status,
  StatusData,
} from 'shared/types/service/WindowServiceTrait/StatusWindowType';
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
// import { useService } from 'utils/common';
// import { ServiceType } from 'shared/types/service';
// import { WindowType } from 'shared/types/WindowType';
import { ActionApi } from 'types/ActionApi';
import { ActionType } from 'shared/types/ActionMessage';

const baseName = 'pages.StatusPage.';

const { t } = useI18n();

const i18n = (relativePath: string) => {
  return t(baseName + relativePath);
};
const actionApi = new ActionApi(baseName);

const statusData = ref<StatusData>({
  status: Status.READY,
  detail: 'I AM READY FOR GENERATING CODE',
});

const onClick = () => {
  console.log('Clicked', statusData.value);
};

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
  <div :class="['status-wrapper', statusData.status]">
    <div class="control-area icon">
      <q-spinner
        v-if="statusData.status === Status.GENERATING"
        color="primary"
        size="2em"
        :thickness="10"
      />
      <q-icon
        name="warning"
        color="red"
        size="2em"
        v-if="statusData.status === Status.ERROR"
      />
      <q-icon
        name="mdi-robot"
        color="green"
        size="2em"
        v-if="statusData.status === Status.READY"
      />
    </div>
    <div class="status-content" :title="statusData.detail" @click="onClick">
      <div class="text">
        {{ i18n(`labels.${statusData.status}`) }}
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.status-wrapper {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  background-color: #2c2c2ca4;
  opacity: 0.8;
  &.READY {
    border-top: 1px solid green;
  }
  &.GENERATING {
    border-top: 1px solid blue;
  }
  &.ERROR {
    border-top: 1px solid red;
  }

  .control-area {
    -webkit-app-region: drag; /* Allows the area to be draggable */
  }

  .icon {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 34px;
    width: 34px;
    .app-img-icon {
      height: 26px;
      width: 26px;
      opacity: 0.6;
      img {
        height: 100%;
        width: 100%;
      }
    }
  }
  .status-content {
    -webkit-app-region: no-drag;
    height: 34px;
    width: calc(100% - 34px);
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #4b5455b9;
    font-size: 12px;
    color: white;
  }
}
</style>

<style lang="scss">
body.body--dark {
  background-color: transparent;
}
</style>
