<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { ActionType } from 'shared/types/ActionMessage';
import { MainWindowPageType } from 'shared/types/MainWindowPageType';
import { ServiceType } from 'shared/types/service';

import CompletionCard from 'components/SettingCards/CompletionCard.vue';
import GeneralCard from 'components/SettingCards/GeneralCard.vue';
import UpdateCard from 'components/SettingCards/UpdateCard.vue';
import { ActionApi } from 'types/ActionApi';
import { useService } from 'utils/common';

const baseName = 'pages.SettingPage.';
const projectMoveNoticeId = 'projectMoveNotice';

const { t } = useI18n();
const dataStoreService = useService(ServiceType.DATA);
const windowService = useService(ServiceType.WINDOW);

const dismissed = ref(false);

const i18n = (relativePath: string, data?: Record<string, unknown>) => {
  if (data) {
    return t('pages.SettingsPage.' + relativePath, data);
  } else {
    return t('pages.SettingsPage.' + relativePath);
  }
};

const dismissNotice = () => {
  dataStoreService.dismissNotice(baseName + projectMoveNoticeId);
  dismissed.value = true;
};

const actionApi = new ActionApi(baseName);
onMounted(async () => {
  actionApi.register(ActionType.MainWindowCheckPageReady, (type) => {
    if (type === MainWindowPageType.Setting) {
      windowService.setMainWindowPageReady(MainWindowPageType.Setting);
    }
  });
  const { notice } = await dataStoreService.getStoreAsync();
  dismissed.value = notice.dismissed.includes(baseName + projectMoveNoticeId);
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
      <q-slide-transition>
        <q-banner
          v-show="!dismissed"
          class="bg-secondary text-white"
          inline-actions
          rounded
        >
          {{ i18n('labels.notice') }}
          <template v-slot:action>
            <q-btn flat :label="i18n('labels.goto')" to="data" />
            <q-btn flat icon="close" @click="dismissNotice" />
          </template>
        </q-banner>
      </q-slide-transition>
      <GeneralCard />
      <CompletionCard />
      <UpdateCard />
    </div>
  </q-page>
</template>

<style scoped></style>
