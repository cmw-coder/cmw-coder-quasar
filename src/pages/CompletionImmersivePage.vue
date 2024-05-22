<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
} from 'vue';

import { ActionType } from 'shared/types/ActionMessage';
import { useHighlighter } from 'stores/highlighter';
import { ActionApi } from 'types/ActionApi';
import { useService } from 'utils/common';
import { WindowType } from 'shared/types/WindowType';
import { ServiceType } from 'shared/types/service';

const baseName = 'pages.CompletionImmersivePage.';

const { codeToHtml } = useHighlighter();

const multiLineDom = ref<HTMLDivElement>();
const singleLineDom = ref<HTMLDivElement>();

const cacheOffset = ref(0);
const completionCount = reactive({
  index: 0,
  total: 0,
});
const currentCompletion = ref('');
const fontSize = ref(0);
const height = ref(0);
const isMultiLine = ref(false);
const transparentFallback = ref(false);

const codeContent = computed(() =>
  codeToHtml(
    ' '.repeat(cacheOffset.value) +
      currentCompletion.value.substring(cacheOffset.value),
    'c',
  ),
);

const dataStoreService = useService(ServiceType.DATA_STORE);
const windowService = useService(ServiceType.WINDOW);

const actionApi = new ActionApi(baseName);
onMounted(async () => {
  actionApi.register(ActionType.CompletionClear, () => {
    cacheOffset.value = 0;
    currentCompletion.value = '';
    completionCount.index = 0;
    completionCount.total = 0;
  });
  actionApi.register(
    ActionType.CompletionSet,
    async ({ completion, count, fontHeight, fontSize: _fontSize }) => {
      cacheOffset.value = 0;
      currentCompletion.value = completion;
      completionCount.index = count.index;
      completionCount.total = count.total;
      fontSize.value = _fontSize;
      height.value = fontHeight;
      const lines = completion.split('\n');
      isMultiLine.value = lines.length > 1;
      await nextTick();
      if (isMultiLine.value && multiLineDom.value) {
        windowService.setWindowSize(
          {
            width: multiLineDom.value.offsetWidth,
            height: multiLineDom.value.offsetHeight,
          },
          WindowType.Completions,
        );
      } else if (!isMultiLine.value && singleLineDom.value) {
        windowService.setWindowSize(
          {
            width: singleLineDom.value.offsetWidth,
            height: singleLineDom.value.offsetHeight,
          },
          WindowType.Completions,
        );
      }
      console.log({
        height: height.value,
        fontSize: fontSize.value,
      });
    },
  );
  actionApi.register(ActionType.CompletionUpdate, (isDelete) => {
    if (isDelete) {
      cacheOffset.value = cacheOffset.value > 0 ? cacheOffset.value - 1 : 0;
    } else {
      cacheOffset.value += 1;
    }
  });

  const appData = await dataStoreService.getAppDataAsync();
  console.log('CompletionImmersivePage.vue appData', appData);
  transparentFallback.value = appData.compatibility.transparentFallback;
});
onBeforeUnmount(() => {
  actionApi.unregister();
});
</script>

<template>
  <q-page v-if="currentCompletion.length" class="row overflow-hidden">
    <div class="column">
      <q-card
        v-show="isMultiLine"
        bordered
        style="font-family: Consolas, monospace, serif; opacity: 80%"
        :style="{
          fontSize: `${fontSize}px`,
          lineHeight: `${height - 1}px`,
        }"
      >
        <div ref="multiLineDom" v-html="codeContent" style="margin-top: -1em" />
      </q-card>
      <div
        ref="singleLineDom"
        v-show="!isMultiLine"
        class="row q-pa-none q-ma-none"
        style="font-family: Consolas, monospace, serif; white-space: pre"
        :style="{
          fontSize: `${fontSize}px`,
          lineHeight: `${height - 1}px`,
        }"
      >
        <div
          v-show="transparentFallback && cacheOffset > 0"
          class="text-primary"
        >
          {{ currentCompletion.substring(0, cacheOffset) }}
        </div>
        <div class="text-grey">
          {{
            ' '.repeat(transparentFallback ? 0 : cacheOffset) +
            currentCompletion.substring(cacheOffset)
          }}
        </div>
      </div>
    </div>
  </q-page>
</template>

<style lang="scss">
body.body--dark {
  background-color: unset;
}

body {
  overflow: hidden;
}
</style>
