<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import CompletionCard from 'components/SettingCards/CompletionCard.vue';
import GeneralCard from 'components/SettingCards/GeneralCard.vue';
import UpdateCard from 'components/SettingCards/UpdateCard.vue';

const { t } = useI18n();

const i18n = (relativePath: string, data?: Record<string, unknown>) => {
  if (data) {
    return t('pages.SettingsPage.' + relativePath, data);
  } else {
    return t('pages.SettingsPage.' + relativePath);
  }
};
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
    </div>
  </q-page>
</template>

<style scoped></style>
