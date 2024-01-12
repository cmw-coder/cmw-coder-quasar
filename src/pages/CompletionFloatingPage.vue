<script setup lang="ts">
import { onMounted, ref } from 'vue';

import CodeBlock from 'components/CodeBlock.vue';
import { ActionType } from 'shared/types/ActionMessage';

const completions = ref<string[]>([]);

onMounted(() => {
  window.actionApi.receive(ActionType.CompletionSet, (data) => {
    completions.value = data.contents;
  });
});
</script>

<template>
  <q-page class="row justify-center q-pa-md">
    <div class="col-10 column q-gutter-sm">
      <div
        v-for="(completion, index) in completions"
        :key="index"
        class="column q-gutter-xs"
      >
        <div class="text-grey text-subtitle1">
          Completion ({{ index + 1 }}/{{ completions.length }}) :
        </div>
        <code-block :src="completion" />
      </div>
    </div>
  </q-page>
</template>

<style scoped></style>
