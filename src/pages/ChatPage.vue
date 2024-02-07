<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import CodeBlock from 'components/CodeBlock.vue';
import { ActionType } from 'shared/types/ActionMessage';
import { b64GbkToUtf8 } from 'utils/iconv';
import { ActionApi } from 'types/ActionApi';

const baseName = 'pages.ChatPage.';

const { t } = useI18n();

const i18n = (relativePath: string) => {
  return t(baseName + relativePath);
};

const codeContent = ref('');

const actionApi = new ActionApi(baseName);
onMounted(() => {
  actionApi.register(ActionType.DebugSync, (data) => {
    codeContent.value = b64GbkToUtf8(data.content);
  });
});
onBeforeUnmount(() => {
  actionApi.unregister();
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
  <q-page class="row justify-evenly q-pa-xl">
    <q-card class="col-grow q-pa-lg">
      <q-card-section class="text-h4 text-center">
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
