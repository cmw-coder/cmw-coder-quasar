<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

import { ActionType } from 'shared/types/ActionMessage';
import { useHighlighter } from 'stores/highlighter';

const { codeToHtml } = useHighlighter();

const cacheOffset = ref(0);
const contents = ref<string[]>([]);
const isMultiLine = computed(
  () => (contents.value[0] ?? '').split('\r\n').length > 1
);

const codeContent = computed(() =>
  codeToHtml(
    ' '.repeat(cacheOffset.value) +
      (contents.value[0] ?? '').substring(cacheOffset.value),
    'c'
  )
);

onMounted(() => {
  window.actionApi.receive(ActionType.CompletionClear, () => {
    cacheOffset.value = 0;
    contents.value = [];
  });
  window.actionApi.receive(ActionType.CompletionSet, (data) => {
    cacheOffset.value = 0;
    contents.value = data.contents;
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
  <q-page v-if="contents.length" class="overflow-hidden">
    <div class="row">
      <div v-show="!isMultiLine" class="code-line text-grey">
        {{ ' '.repeat(cacheOffset) + contents[0].substring(cacheOffset) }}
      </div>
      <q-card v-show="isMultiLine" class="code-snippet" bordered>
        <div v-html="codeContent" />
      </q-card>
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

.code-snippet {
  font-family: Consolas, monospace, serif;
  font-size: 9pt * 1.06;
  line-height: 10pt;
  margin-top: 9pt - 1px;
  opacity: 90%;
}
</style>
