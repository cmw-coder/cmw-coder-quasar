<script setup lang="ts">
import { onMounted, ref } from 'vue';

import CodeBlock from 'components/CodeBlock.vue';
import { ActionType } from 'shared/types/ActionMessage';
import { ActionApi } from 'types/ActionApi';

const baseName = 'pages.CompletionFloatingPage.';

const completion = ref('');

const actionApi = new ActionApi(baseName);
onMounted(() => {
  actionApi.register(ActionType.CompletionSet, (data) => {
    completion.value = data.completion;
  });
});
</script>

<template>
  <q-page class="row justify-center q-pa-md">
    <div class="col-10 column q-gutter-sm">
      <code-block :src="completion" />
    </div>
  </q-page>
</template>

<style scoped></style>
