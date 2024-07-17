<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import CompletionCard from 'components/SettingCards/CompletionCard.vue';
import GeneralCard from 'components/SettingCards/GeneralCard.vue';
import UpdateCard from 'components/SettingCards/UpdateCard.vue';
import ProjectIdCard from 'components/SettingCards/ProjectIdCard.vue';
import { onBeforeUnmount, onMounted } from 'vue';
import { ActionApi } from 'types/ActionApi';
import { ActionType } from 'shared/types/ActionMessage';
import { MainWindowPageType } from 'shared/types/MainWindowPageType';
import { ServiceType } from 'shared/types/service';
import { useService } from 'utils/common';

const baseName = 'pages.SettingPage.';
const actionApi = new ActionApi(baseName);
const windowService = useService(ServiceType.WINDOW);

const { t } = useI18n();

const i18n = (relativePath: string, data?: Record<string, unknown>) => {
  if (data) {
    return t('pages.SettingsPage.' + relativePath, data);
  } else {
    return t('pages.SettingsPage.' + relativePath);
  }
};

onMounted(() => {
  actionApi.register(ActionType.MainWindowCheckPageReady, (type) => {
    if (type === MainWindowPageType.Setting) {
      windowService.setMainWindowPageReady(MainWindowPageType.Setting);
    }
  });
});

onBeforeUnmount(() => {
  actionApi.unregister();
});
</script>

<template>
  <q-page class="row justify-evenly q-pa-xl">
    <div class="column col-grow q-gutter-y-md">
      <div class="text-center text-h4">
        {{ i18n('labels.title') }}
      </div>
      <GeneralCard />
      <CompletionCard />
      <UpdateCard />
      <ProjectIdCard />
    </div>
  </q-page>
</template>

<style scoped></style>
