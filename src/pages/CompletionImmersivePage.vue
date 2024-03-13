<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue';

import { ActionType } from 'shared/types/ActionMessage';
import { useHighlighter } from 'stores/highlighter';
import { ActionApi } from 'types/ActionApi';

const baseName = 'pages.CompletionImmersivePage.';

const fontSizeTable: Record<number, number> = {
  12: 0.91,
  14: 0.91,
  16: 0.91,
  17: 0.963,
  18: 0.91,
  20: 0.91,
  22: 0.992,
  26: 0.91,
  30: 0.91,
  34: 0.91,
  38: 0.91,
  40: 0.91,
  42: 0.91,
  48: 0.947,
  52: 0.91,
  64: 0.91,
  74: 0.934,
  104: 0.927,
};

const { codeToHtml } = useHighlighter();

const cacheOffset = ref(0);
const completionCount = reactive({
  index: 0,
  total: 0,
});
const currentCompletion = ref('');
const height = ref(0);
const fontSize = computed(() =>
  fontSizeTable[height.value]
    ? fontSizeTable[height.value] * height.value
    : -0.000000000506374957617199 * height.value ** 6 +
      0.000000123078838391882 * height.value ** 5 -
      0.0000118441038684185 * height.value ** 4 +
      0.000574698566099494 * height.value ** 3 -
      0.0147437317361461 * height.value ** 2 +
      1.09720488138051 * height.value,
);
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
  actionApi.register(
    ActionType.CompletionSet,
    ({ completion, count, fontHeight }) => {
      cacheOffset.value = 0;
      currentCompletion.value = completion;
      completionCount.index = count.index;
      completionCount.total = count.total;
      height.value = fontHeight;
      console.log({ height: height.value, fontSize: fontSize.value });
    },
  );
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
      <div
        v-show="!isMultiLine"
        class="text-grey"
        style="white-space: pre"
        :style="{
          fontFamily: 'Consolas',
          fontSize: `${fontSize}px`,
          lineHeight: `${height - 1}px`,
        }"
      >
        {{ ' '.repeat(cacheOffset) + currentCompletion.substring(cacheOffset) }}
      </div>
      <q-card
        v-show="isMultiLine"
        bordered
        style="font-family: monospace, serif; opacity: 90%"
        :style="{
          fontFamily: 'Consolas',
          fontSize: `${fontSize}pt`,
          lineHeight: `${height - 1}px`,
          // marginTop: `${fontSize}pt - 1px`,
          // paddingTop: '7pt',
        }"
      >
        <div v-html="codeContent" />
      </q-card>
    </div>
  </q-page>
</template>

<style lang="scss">
body.body--dark {
  background-color: unset;
}
</style>
