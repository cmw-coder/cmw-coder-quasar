<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Action } from 'app/src-electron/types/action';
import { SyncActionData } from 'types/action';
import { b64GbkToUtf8 } from 'utils/iconv';

const completion = ref('');

onMounted(() => {
  window.subscribeApi.action(
    Action.CompletionGenerate,
    (data: SyncActionData) => {
      completion.value = b64GbkToUtf8(data.content).split('\n')[0].trimEnd();
    }
  );
});
</script>

<template>
  <q-page>
    <code class="text-grey">
      {{ completion}}
    </code>
  </q-page>
</template>

<style lang="scss">
body.body--dark {
  background-color: unset;
}
</style>
