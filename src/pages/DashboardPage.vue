<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { onMounted, ref } from 'vue';

import { Action } from 'app/src-electron/types/action';

const { t } = useI18n();

const i18n = (relativePath: string) => {
  return t('pages.DashboardPage.' + relativePath);
};

const markdownContent = ref('');

onMounted(() => {
  window.subscribeApi.action(Action.Sync, (data: string) => {
    console.log(data);
    // markdownContent.value = `Current Path: \n${path}\n\nContent:\n\n\`\`\`\n${content}\n\`\`\``;
  });
});
</script>

<template>
  <q-page class="row justify-evenly q-pa-lg">
    <q-card class="col-10" flat>
      <q-card-section class="text-h4 text-white text-center">
        {{ i18n('labels.title') }}
      </q-card-section>
      <q-card-section class="text-h6 text-grey text-center">
        {{ i18n('labels.intro') }}
      </q-card-section>
      <q-card-section>
        <q-markdown :src="markdownContent" />
      </q-card-section>
    </q-card>
  </q-page>
</template>
