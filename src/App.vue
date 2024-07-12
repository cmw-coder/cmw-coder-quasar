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
