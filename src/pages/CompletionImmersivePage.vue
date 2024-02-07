<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue';

import { ActionType } from 'shared/types/ActionMessage';
import { useHighlighter } from 'stores/highlighter';
import { ActionApi } from 'types/ActionApi';

const baseName = 'pages.CompletionImmersivePage.';

const { codeToHtml } = useHighlighter();

const cacheOffset = ref(0);
const completionCount = reactive({
  index: 0,
  total: 0,
});
const currentCompletion = ref('');
const isMultiLine = computed(
  () => currentCompletion.value.split('\r\n').length > 1,
);

const codeContent = computed(() =>
  codeToHtml(
    ' '.repeat(cacheOffset.value) +
      currentCompletion.value.substring(cacheOffset.value),
    'c',
  ),
);

const actionApi = new ActionApi(baseName);
onMounted(() => {
  actionApi.register(ActionType.CompletionClear, () => {
    cacheOffset.value = 0;
    currentCompletion.value = '';
    completionCount.index = 0;
    completionCount.total = 0;
  });
  actionApi.register(ActionType.CompletionSet, ({ completion, count }) => {
    cacheOffset.value = 0;
    currentCompletion.value = completion;
    completionCount.index = count.index;
    completionCount.total = count.total;
    console.log('Inline completion:', currentCompletion.value);
  });
  actionApi.register(ActionType.CompletionUpdate, (isDelete) => {
    if (isDelete) {
      cacheOffset.value = cacheOffset.value > 0 ? cacheOffset.value - 1 : 0;
    } else {
      cacheOffset.value += 1;
    }
  });
});
onBeforeUnmount(() => {
  actionApi.unregister();
});
</script>

<template>
  <q-page v-if="currentCompletion.length" class="overflow-hidden">
    <div class="row">
      <div v-show="!isMultiLine" class="code-line text-grey">
        {{ ' '.repeat(cacheOffset) + currentCompletion.substring(cacheOffset) }}
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
