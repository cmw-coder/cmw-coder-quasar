<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue';

import { ActionType } from 'shared/types/ActionMessage';
import { useHighlighter } from 'stores/highlighter';
import { useSettingsStore } from 'stores/settings';
import { ActionApi } from 'types/ActionApi';

const baseName = 'pages.CompletionImmersivePage.';

const { codeToHtml } = useHighlighter();
const { fontSize } = storeToRefs(useSettingsStore());

const cacheOffset = ref(0);
const completionCount = reactive({
  index: 0,
  total: 0,
});
const currentCompletion = ref('');
const isMultiLine = computed(
  () => currentCompletion.value.split('\r\n').length > 1,
);

const transform = computed(() => {
  const scaleX = -0.0017530120481928 * fontSize.value + 1.0398602409639;
  const scaleY = -0.0021124497991968 * fontSize.value + 1.0074489959839;
  const offsetX = 0.011991807228916 * fontSize.value + 0.18793785542169;
  const offsetY = -0.95 * fontSize.value + 22.34;
  return `scale(${scaleX}, ${scaleY}) translate(${offsetX}pt, ${offsetY}pt)`;
});

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
    console.log(transform.value);
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
      <div
        v-show="!isMultiLine"
        class="text-grey"
        style="white-space: pre"
        :style="{
          fontFamily: 'Consolas',
          fontSize: `${fontSize}pt`,
          transform: transform,
          transformOrigin: 'center left',
        }"
      >
        {{ ' '.repeat(0) + currentCompletion.substring(0) }}
      </div>
      <q-card
        v-show="isMultiLine"
        class="code-snippet"
        bordered
        style="font-family: monospace, serif; opacity: 90%"
        :style="{
          fontFamily: 'Consolas',
          fontSize: `${fontSize * 1.06}pt`,
          lineHeight: '10pt',
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
