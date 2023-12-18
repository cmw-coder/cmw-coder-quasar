<script setup lang="ts">
import { onMounted, ref } from 'vue';

import CodeBlock from 'components/CodeBlock.vue';
import { ActionType } from 'shared/types/ActionApi';

const completion = ref('');

onMounted(() => {
  window.actionApi.receive(ActionType.CompletionSnippet, (data) => {
    completion.value = data[0];
  });
});
</script>

<template>
  <q-page>
    <code-block :src="completion" />
  </q-page>
</template>

<style scoped></style>
