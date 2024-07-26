<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useService } from 'utils/common';
import { ServiceType } from 'shared/types/service';
import { ReviewData, ReviewState } from 'shared/types/review';
import { ActionApi } from 'types/ActionApi';
import { ActionType } from 'shared/types/ActionMessage';
import { MainWindowPageType } from 'shared/types/MainWindowPageType';
import FunctionPanel from 'components/ReviewPanels/FunctionPanel.vue';
import { Selection } from 'shared/types/Selection';
const formatSelection = (selection: Selection) => {
  const filePathArr = selection.file.split(/\\|\//);
  const fileName = filePathArr[filePathArr.length - 1];
  return {
    fileName,
    rangeStr: `${selection.range.start.line} - ${selection.range.end.line}`,
    ...selection,
  };
};

const reviewStateIconMap: Record<ReviewState, string> = {
  [ReviewState.Start]: 'mdi-clock-outline',
  [ReviewState.References]: 'mdi-comment-text-outline',
  [ReviewState.Finished]: 'mdi-check-circle-outline',
  [ReviewState.Error]: 'mdi-alert-circle-outline',
  [ReviewState.First]: 'mdi-comment-text-outline',
  [ReviewState.Second]: 'mdi-comment-text-outline',
  [ReviewState.Third]: 'mdi-comment-text-outline',
};

const baseName = 'pages.ReviewPage.';
const { t } = useI18n();
const websocketService = useService(ServiceType.WEBSOCKET);
const windowService = useService(ServiceType.WINDOW);
const splitterModel = ref<number>(20);
const actionApi = new ActionApi(baseName);

const reviewList = ref<ReviewData[]>([]);

const i18n = (relativePath: string, data?: Record<string, unknown>) => {
  if (data) {
    return t(baseName + relativePath, data);
  } else {
    return t(baseName + relativePath);
  }
};
const currentFilePath = ref<string>();

const startCurrentFileReview = async () => {
  if (!currentFilePath.value) {
    return;
  }
  windowService.reviewFile(currentFilePath.value);
};
let getCurrentPathInterval: NodeJS.Timer | undefined = undefined;

const activeFile = ref<string>('');
const fileList = computed(() => {
  const data = reviewList.value.map((item) => item.selection.file);
  return [...new Set(data)];
});
const activeFileReviewList = computed(() => {
  return reviewList.value.filter(
    (item) => item.selection.file === activeFile.value,
  );
});

const getReviewDataList = async () => {
  reviewList.value = await windowService.getReviewData();
  if (!activeFile.value) {
    activeFile.value = reviewList.value[0]?.selection?.file;
  }
};

onMounted(async () => {
  currentFilePath.value = await websocketService.getCurrentFile();
  getCurrentPathInterval = setInterval(async () => {
    currentFilePath.value = await websocketService.getCurrentFile();
  }, 100);

  getReviewDataList();

  actionApi.register(ActionType.ReviewDataListUpdate, (data) => {
    reviewList.value = data;
    if (!activeFile.value) {
      activeFile.value = data[0]?.selection?.file;
    }
  });

  actionApi.register(ActionType.ReviewDataUpdate, (data) => {
    const index = reviewList.value.findIndex(
      (item) => item.reviewId === data.reviewId,
    );
    if (index !== -1) {
      reviewList.value[index] = data;
    }
  });

  actionApi.register(ActionType.MainWindowCheckPageReady, (type) => {
    if (type === MainWindowPageType.Review) {
      windowService.setMainWindowPageReady(MainWindowPageType.Review);
    }
  });
});

onBeforeUnmount(() => {
  if (getCurrentPathInterval) {
    clearInterval(getCurrentPathInterval);
    getCurrentPathInterval = undefined;
  }
  actionApi.unregister();
});
</script>

<template>
  <q-page style="height: 100%">
    <div class="current-file">
      <q-list bordered>
        <q-item>
          <q-item-section>
            <q-item-label v-if="currentFilePath">
              {{
                i18n('labels.currentFile', {
                  file: currentFilePath,
                })
              }}
            </q-item-label>
            <q-item-label v-else class="text-italic text-grey">
              {{ i18n('labels.noFile') }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn
              color="primary"
              unelevated
              :disable="!currentFilePath"
              :label="i18n('labels.reviewFile')"
              @click="() => startCurrentFileReview()"
            />
          </q-item-section>
        </q-item>
      </q-list>
    </div>
    <div class="rest-content">
      <q-splitter v-model="splitterModel" style="height: 100%">
        <template v-slot:before>
          <q-list padding separator class="text-primary full-height">
            <q-item
              v-for="file in fileList"
              clickable
              v-ripple
              :active="file === activeFile"
              @click="
                () => {
                  activeFile = file;
                }
              "
              :key="file"
            >
              <q-item-section :title="file" style="overflow: hidden">{{
                file
              }}</q-item-section>
            </q-item>
          </q-list>
        </template>

        <template v-slot:after>
          <q-list padding separator class="text-primary full-height">
            <q-expansion-item
              v-for="review in activeFileReviewList"
              :key="review.reviewId"
              expand-separator
              default-opened
            >
              <template v-slot:header>
                <q-item-section avatar>
                  <q-icon
                    v-if="review.state !== ReviewState.Start"
                    :name="reviewStateIconMap[review.state]"
                  />
                  <q-circular-progress
                    v-else
                    indeterminate
                    size="22px"
                    :thickness="0.4"
                    color="lime"
                    track-color="grey-3"
                    center-color="grey-8"
                  />
                </q-item-section>

                <q-item-section>
                  {{
                    `${formatSelection(review.selection).fileName}  ${formatSelection(review.selection).rangeStr}`
                  }}</q-item-section
                >
              </template>
              <FunctionPanel :review-data="review" />
            </q-expansion-item>
          </q-list>
        </template>
      </q-splitter>
    </div>
  </q-page>
</template>

<style lang="scss" scoped>
.rest-content {
  height: calc(100% - 54px);
  overflow-y: hidden;
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-top: none;
}
</style>
