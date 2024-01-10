<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

import { CompletionType } from 'shared/types/common';
import { ActionType } from 'shared/types/ActionMessage';
import { useHighlighter } from 'stores/highlighter';

const { codeToHtml } = useHighlighter();

const cacheOffset = ref(0);
const contents = ref<string[]>([]);
const type = ref<CompletionType>(CompletionType.Line);

const codeContent = computed(() =>
  codeToHtml(
    ' '.repeat(cacheOffset.value) +
      (contents.value[0] ?? '').substring(cacheOffset.value),
    'c'
  )
);

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
    <div class="row">
      <div v-if="type === CompletionType.Line" class="code-line text-grey">
        {{
          ' '.repeat(cacheOffset) + (contents[0] ?? '').substring(cacheOffset)
        }}
      </div>
      <q-card v-if="type !== CompletionType.Line" class="code-snippet" bordered>
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
