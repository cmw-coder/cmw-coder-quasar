<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue';

import { ActionType } from 'shared/types/ActionMessage';
import { useHighlighter } from 'stores/highlighter';
import { ActionApi } from 'types/ActionApi';
import { useService } from 'utils/common';
import { FONT_SIZE_MAPPING } from 'shared/constants/common';
import { ServiceType } from 'shared/types/service';

const baseName = 'pages.CompletionImmersivePage.';

const { codeToHtml } = useHighlighter();

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
    ({ completion, count, fontHeight }) => {
      cacheOffset.value = 0;
      currentCompletion.value = completion;
      completionCount.index = count.index;
      completionCount.total = count.total;
      fontSize.value = FONT_SIZE_MAPPING[fontHeight]
        ? FONT_SIZE_MAPPING[fontHeight] * fontHeight
        : -0.000000000506374957617199 * fontHeight ** 6 +
          0.000000123078838391882 * fontHeight ** 5 -
          0.0000118441038684185 * fontHeight ** 4 +
          0.000574698566099494 * fontHeight ** 3 -
          0.0147437317361461 * fontHeight ** 2 +
          1.09720488138051 * fontHeight;
      height.value = fontHeight;
      isMultiLine.value = completion.split('\r\n').length > 1;
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
        <div v-html="codeContent" style="margin-top: -1em" />
      </q-card>
      <div
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
