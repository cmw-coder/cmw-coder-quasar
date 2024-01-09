<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { CompletionType } from 'shared/types/common';
import { ActionType } from 'shared/types/ActionMessage';

const cacheOffset = ref(0);
const contents = ref<string[]>([]);
const type = ref<CompletionType>(CompletionType.Line);

onMounted(() => {
  window.actionApi.receive(ActionType.CompletionSet, (data) => {
    cacheOffset.value = 0;
    contents.value = data.contents;
    type.value = data.type;
    console.log('Inline completions:', contents.value);
  });
  window.actionApi.receive(ActionType.CompletionUpdate, (isDelete) => {
    if (isDelete) {
      cacheOffset.value = cacheOffset.value > 0 ? cacheOffset.value - 1 : 0;
    } else {
      cacheOffset.value += 1;
    }
  });
});
</script>

<template>
  <q-page class="overflow-hidden">
    <div class="code-line text-grey">
      {{ ' '.repeat(cacheOffset) + (contents[0] ?? '').substring(cacheOffset) }}
    </div>
  </q-page>
</template>

<style lang="scss">
body.body--dark {
  background-color: unset;
}

.code-line {
  font-family: Consolas, monospace, serif;
  font-size: 9pt * 1.06;
  padding-top: 7pt;
  white-space: pre;
}
</style>
