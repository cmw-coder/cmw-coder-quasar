<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { Action } from 'app/src-electron/types/action';
import CodeBlock from 'components/CodeBlock.vue';
import { SyncActionData } from 'types/action';
import { b64GbkToUtf8 } from 'utils/iconv';

const completion = ref('');

onMounted(() => {
  window.subscribeApi.action(
    Action.CompletionGenerate,
    (data: SyncActionData) => {
      completion.value = b64GbkToUtf8(data.content);
    }
  );
});
</script>

<template>
  <q-page>
    <code-block :src="completion" />
  </q-page>
</template>

<style scoped></style>
