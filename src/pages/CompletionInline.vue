<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { ActionType } from 'shared/types/ActionApi';

const completion = ref('');

onMounted(() => {
  window.actionApi.receive(ActionType.CompletionInline, (data) => {
    completion.value = data[0].split('\n')[0].trimEnd();
  });
});
</script>

<template>
  <q-page>
    <code class="text-grey">
      {{ completion }}
    </code>
  </q-page>
</template>

<style lang="scss">
body.body--dark {
  background-color: unset;
}
</style>
