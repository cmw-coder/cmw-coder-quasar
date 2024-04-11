<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';

import { ActionType } from 'shared/types/ActionMessage';
import { useHighlighter } from 'stores/highlighter';
import { useSettingsStore } from 'stores/settings';
import { ActionApi } from 'types/ActionApi';
import { useInvokeService } from 'boot/useInvokeService';

const baseName = 'web.app.';

const { initialize } = useHighlighter();
const { applyDarkMode } = useSettingsStore();

initialize().then();
applyDarkMode();

const reloadKey = ref(false);

const actionApi = new ActionApi(baseName);
onMounted(async () => {
  actionApi.register(ActionType.RouterReload, () => {
    reloadKey.value = !reloadKey.value;
  });

  const invokeService = useInvokeService();
  const invokeRes = await invokeService.sayHello('hi');
  console.log('invokeRes', invokeRes);
});
onBeforeUnmount(() => {
  actionApi.unregister();
});
</script>

<template>
  <router-view :key="`${baseName}-${reloadKey ? '0' : '1'}`" />
</template>
