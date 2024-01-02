<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { ActionType } from 'shared/types/ActionMessage';

const completion = ref('');
const cacheOffset = ref(0);

onMounted(() => {
  window.actionApi.receive(ActionType.CompletionDisplay, (data) => {
    completion.value = data.completions[0] ?? '';
    cacheOffset.value = 0;
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
  <q-page>
    <div class="code-line text-grey">
      {{ ' '.repeat(cacheOffset) + completion.substring(cacheOffset) }}
    </div>
  </q-page>
</template>

<style lang="scss">
body.body--dark {
  background-color: unset;
}

.code-line {
  font-family: Consolas, monospace, serif;
  font-size: 12px;
  letter-spacing: 0.4px;
  white-space: pre;
}
</style>
