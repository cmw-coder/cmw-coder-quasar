<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { onMounted, ref } from 'vue';

import { Action } from 'app/src-electron/types/action';
import CodeBlock from 'components/CodeBlock.vue';
import { SyncActionData } from 'types/action';
import { b64GbkToUtf8 } from 'utils/iconv';

const { t } = useI18n();

const i18n = (relativePath: string) => {
  return t('pages.DashboardPage.' + relativePath);
};

const codeContent = ref('');

onMounted(() => {
  window.subscribeApi.action(Action.Sync, (data: SyncActionData) => {
    codeContent.value = b64GbkToUtf8(data.content);
  });
});
</script>

<style lang="scss">
.shiki-codes {
  code {
    counter-reset: step;
    counter-increment: step 0;
  }

  code .line::before {
    content: counter(step);
    counter-increment: step;
    width: 1rem;
    margin-right: 1.5rem;
    display: inline-block;
    text-align: right;
    color: #777777;
  }

  pre {
    margin: unset;
  }
}
</style>

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
        <code-block :src="codeContent" />
      </q-card-section>
    </q-card>
  </q-page>
</template>
