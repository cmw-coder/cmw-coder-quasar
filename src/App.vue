<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { Dark } from 'quasar';

import { ActionType } from 'shared/types/ActionMessage';
import { useHighlighter } from 'stores/highlighter';
import { ActionApi } from 'types/ActionApi';
import { useService } from 'utils/common';
import { ServiceType } from 'shared/types/service';

const baseName = 'web.app.';

const { initialize } = useHighlighter();

initialize().then();

const reloadKey = ref(false);
const configService = useService(ServiceType.CONFIG);

const actionApi = new ActionApi(baseName);
onMounted(async () => {
  actionApi.register(ActionType.RouterReload, () => {
    reloadKey.value = !reloadKey.value;
  });
  actionApi.register(ActionType.ToggleDarkMode, (isDark) => {
    Dark.set(isDark);
  });
  const darkMode = await configService.getConfig('darkMode');
  Dark.set(darkMode);
});
onBeforeUnmount(() => {
  actionApi.unregister();
});
</script>

<template>
  <router-view :key="`${baseName}-${reloadKey ? '0' : '1'}`" />
</template>
