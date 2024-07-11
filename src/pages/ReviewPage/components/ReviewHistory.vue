<script lang="ts" setup>
import { ReviewData } from 'shared/types/review';
import { ServiceType } from 'app/src-electron/shared/types/service';
import { useService } from 'app/src/utils/common';
import { Ref, computed, onMounted, ref, watch } from 'vue';
import { Selection } from 'shared/types/Selection';
import ReviewView from 'pages/ReviewPage/components/ReviewView.vue';

const show = ref(false);
const mounted = ref(false);

const selectedFile = ref('');
const selectedReviewId: Ref<
  | {
      value: string;
      label: string;
    }
  | undefined
> = ref(undefined);

const dataStoreService = useService(ServiceType.DATA_STORE);

const formatSelection = (selection: Selection) => {
  const filePathArr = selection.file.split('\\');
  const fileName = filePathArr[filePathArr.length - 1];
  return {
    fileName,
    rangeStr: `${selection.range.start.line} - ${selection.range.end.line}`,
    ...selection,
  };
};

const files = ref([] as string[]);
const reviewFileContent = ref([] as ReviewData[]);
const compuReviewFileContentOptions = computed(() => {
  return reviewFileContent.value.map((item) => ({
    label: `${formatSelection(item.selection).fileName} ${formatSelection(item.selection).rangeStr}`,
    value: item.reviewId,
  }));
});
const selectedReviewItem = computed(() => {
  return reviewFileContent.value.find(
    (item) => item.reviewId === selectedReviewId.value?.value,
  );
});

const showHandle = async () => {
  show.value = true;
  selectedFile.value = '';
  selectedReviewId.value = undefined;
  files.value = await dataStoreService.getReviewHistoryFiles();
};

watch(selectedFile, async (newVal) => {
  if (newVal) {
    reviewFileContent.value =
      await dataStoreService.getReviewFileContent(newVal);
  }
});

const retryHandle = async () => {
  if (selectedReviewItem.value) {
    console.log('retryHandle', selectedReviewItem.value);
  }
};

onMounted(async () => {
  mounted.value = true;
});
</script>
<template>
  <div class="review-history">
    <q-btn flat @click="() => showHandle()">History</q-btn>
    <Teleport v-if="mounted" to=".review-wrapper">
      <q-card class="history-content" v-if="show">
        <div class="header">
          <div class="left">
            <q-btn
              flat
              size="md"
              label="Back"
              icon="mdi-keyboard-backspace"
              @click="
                () => {
                  show = false;
                }
              "
            />
          </div>
          <div class="right">
            <div class="title text-bold text-h8">HISTORY</div>
          </div>
        </div>
        <div class="content">
          <div class="q-pa-md">
            <div class="q-gutter-md">
              <q-select v-model="selectedFile" :options="files" label="Day" />
            </div>
            <div class="q-gutter-md">
              <q-select
                v-model="selectedReviewId"
                :options="compuReviewFileContentOptions"
                label="ReviewItem"
              />
            </div>
          </div>
          <div class="review-view">
            <ReviewView
              v-if="selectedReviewItem"
              :review-data="selectedReviewItem"
              @retry="retryHandle"
            />
          </div>
        </div>
      </q-card>
    </Teleport>
  </div>
</template>

<style scoped lang="scss">
.review-history {
  position: relative;
}
.history-content {
  position: absolute;
  height: 100%;
  width: 100%;
  top: 0px;
  z-index: 300;
  .header {
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 10px;
    border-bottom: 1px solid #eee;
  }
  .content {
    height: calc(100% - 50px);
    width: 100%;
    overflow-y: auto;
    .review-view {
      padding: 10px;
    }
  }
}
</style>
