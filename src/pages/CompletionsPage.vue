<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue';

import { NEW_LINE_REGEX } from 'shared/constants/common';
import { ActionType } from 'shared/types/ActionMessage';
import { GenerateType } from 'shared/types/common';
import { ServiceType } from 'shared/types/service';
import { ActionApi } from 'types/ActionApi';
import { i18nSubPath, useService } from 'utils/common';
import SingleLine from 'components/CompletionCodes/SingleLine.vue';
import MultiLine from 'components/CompletionCodes/MultiLine.vue';

const baseName = 'pages.CompletionsPage';

const dataStoreService = useService(ServiceType.DATA);

const cacheOffset = ref(0);
const completionCount = reactive({
  index: 0,
  total: 0,
});
const currentCompletion = ref('');
const fontSize = ref(0);
const generateType = ref<GenerateType>();
const height = ref(0);
const isMultiLine = ref(false);
const transparentFallback = ref(false);

const i18n = i18nSubPath(baseName);

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
    async ({ type, completion, count, fontHeight, fontSize: _fontSize }) => {
      cacheOffset.value = 0;
      currentCompletion.value = completion;
      completionCount.index = count.index;
      completionCount.total = count.total;
      fontSize.value = _fontSize;
      height.value = fontHeight;
      generateType.value = type;
      await nextTick();
      switch (generateType.value) {
        case GenerateType.Common: {
          isMultiLine.value = completion.split(NEW_LINE_REGEX).length > 1;
          break;
        }
        case GenerateType.PasteReplace: {
          break;
        }
      }
    },
  );
  actionApi.register(ActionType.CompletionUpdate, (isDelete) => {
    if (isDelete) {
      cacheOffset.value = cacheOffset.value > 0 ? cacheOffset.value - 1 : 0;
    } else {
      cacheOffset.value += 1;
    }
  });

  const appData = await dataStoreService.getStoreAsync();
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
      <template v-if="generateType == GenerateType.Common">
        <multi-line
          v-show="isMultiLine"
          :cache-offset="cacheOffset"
          :current-completion="currentCompletion"
          :font-size="fontSize"
          :height="height"
        />
        <single-line
          v-show="!isMultiLine"
          class="q-ma-none"
          :cache-offset="cacheOffset"
          :current-completion="currentCompletion"
          :font-size="fontSize"
          :height="height"
          :transparent-fallback="transparentFallback"
        />
      </template>
      <q-card
        v-else-if="generateType == GenerateType.PasteReplace"
        bordered
        flat
        style="opacity: 80%"
      >
        <q-card-section class="column q-gutter-md">
          <div class="text-h6">
            {{ i18n(`labels.title.${generateType}`) }}
          </div>
          <multi-line
            :cache-offset="cacheOffset"
            :current-completion="currentCompletion"
            :font-size="fontSize"
            :height="height"
          />
        </q-card-section>
      </q-card>
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
