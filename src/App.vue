<script setup lang="ts">
import { useQuasar } from 'quasar';
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { ActionType } from 'shared/types/ActionMessage';
import { ServiceType } from 'shared/types/service';
import { useHighlighter } from 'stores/highlighter';
import { ActionApi } from 'types/ActionApi';
import { useService } from 'utils/common';

const baseName = 'web.app.';
const { initialize } = useHighlighter();
const { locale } = useI18n({ useScope: 'global' });
const { dark, lang } = useQuasar();

initialize().then();

const reloadKey = ref(false);
const configService = useService(ServiceType.CONFIG);

const actionApi = new ActionApi(baseName);

onMounted(async () => {
  actionApi.register(ActionType.ToggleDarkMode, (isDark) => {
    dark.set(isDark);
  });
  actionApi.register(ActionType.SwitchLocale, (newLocale) => {
    locale.value = newLocale;
  });
  const darkMode = await configService.getConfig('darkMode');
  if (darkMode === undefined) {
    dark.set('auto');
    await configService.setConfig('darkMode', dark.isActive);
  } else {
    dark.set(darkMode);
  }

  const currentLocale = await configService.getConfig('locale');
  if (!currentLocale?.length) {
    locale.value = lang.getLocale() ?? 'en-US';
    await configService.setConfig('locale', locale.value);
  } else {
    locale.value = currentLocale;
  }
});
onBeforeUnmount(() => {
  actionApi.unregister();
});
</script>

<template>
  <router-view :key="`${baseName}-${reloadKey ? '0' : '1'}`" />
</template>

<style>
/* 整个滚动条 */
::-webkit-scrollbar {
  width: 8px; /* 宽度 */
  height: 8px;
}

/* 滚动条轨道 */
::-webkit-scrollbar-track {
  background: #f1f1f1; /* 轨道背景 */
}

/* 滚动条滑块 */
::-webkit-scrollbar-thumb {
  background: #888; /* 滑块颜色 */
}

/* 滑块在悬停时 */
::-webkit-scrollbar-thumb:hover {
  background: #555; /* 悬停时的滑块颜色 */
}
</style>
