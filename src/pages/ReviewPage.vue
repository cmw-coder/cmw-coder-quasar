<script lang="ts" setup>
// import { useQuasar } from 'quasar';
import { PropType, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { ServiceType } from 'shared/types/service';
import { WindowType } from 'shared/types/WindowType';
import { Selection } from 'shared/types/Selection';
import { useService } from 'utils/common';
import { useHighlighter } from 'stores/highlighter';

const props = defineProps({
  windowType: {
    type: String as PropType<WindowType>,
    default: WindowType.Commit,
  },
});

const { codeToHtml } = useHighlighter();
const windowService = useService(ServiceType.WINDOW);

const selection = ref<Selection | undefined>(undefined);

const { t } = useI18n();
// const { notify } = useQuasar();
// const configService = useService(ServiceType.CONFIG);
// const windowService = useService(ServiceType.WINDOW);

const baseName = 'pages.ReviewPage.';

const i18n = (relativePath: string) => {
  return t(baseName + relativePath);
};

// const currentFile = ref<string>('');

onMounted(async () => {
  console.log('ReviewPage mounted', props.windowType);
  selection.value = await windowService.getReviewSelection();
});

const formatRes = (selection: Selection) => {
  const filePathArr = selection.file.split('\\');
  const fileName = filePathArr[filePathArr.length - 1];
  return {
    fileName,
    rangeStr: `${selection.range.start.line} - ${selection.range.end.line}`,
    ...selection,
  };
};
</script>

<template>
  <q-page class="row items-center justify-evenly q-pa-xl">
    <div class="column col-grow q-gutter-y-md">
      <div class="text-center text-h4">
        {{ i18n('labels.title') }}
      </div>
      <div class="column q-gutter-y-md code-content" v-if="selection">
        <div class="row items-baseline justify-between">
          <div
            class="text-bold text-grey text-h6"
            :title="`${selection.file} ${formatRes(selection).rangeStr}`"
          >
            <span class="review-file-name">{{
              formatRes(selection).fileName
            }}</span>
            <span class="review-range">{{
              formatRes(selection).rangeStr
            }}</span>
          </div>
        </div>
        <q-card
          class="selection-content-card row"
          style="padding: 0 10px"
          bordered
          flat
        >
          <div
            class="review-file-content"
            v-html="codeToHtml(selection.content, selection.language)"
          />
        </q-card>
      </div>
      <div class="column q-gutter-y-md"></div>
      <div class="column q-gutter-y-md"></div>
      <div class="row q-gutter-x-md"></div>
    </div>
  </q-page>
</template>

<style lang="scss" scoped>
.review-range {
  margin-left: 10px;
}
</style>
