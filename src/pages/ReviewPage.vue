<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref, toRaw } from 'vue';
import { useI18n } from 'vue-i18n';
import { useService } from 'utils/common';
import { ServiceType } from 'shared/types/service';
import {
  Feedback,
  ReviewData,
  ReviewState,
  reviewStateIconMap,
} from 'shared/types/review';
import { ActionApi } from 'types/ActionApi';
import { ActionType } from 'shared/types/ActionMessage';
import { MainWindowPageType } from 'shared/types/MainWindowPageType';
import FunctionPanel from 'components/ReviewPanels/FunctionPanel.vue';
import { Selection } from 'shared/types/Selection';
import { useQuasar } from 'quasar';
import { DateTime } from 'luxon';

const { dialog } = useQuasar();

const formatSelection = (selection: Selection) => {
  const filePathArr = selection.file.split(/\\|\//);
  const fileName = filePathArr[filePathArr.length - 1];
  return {
    fileName,
    rangeStr: `${selection.range.start.line} - ${selection.range.end.line}`,
    ...selection,
  };
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

const getFileName = (filePath: string) => {
  const filePathArr = filePath.split(/\\|\//);
  return filePathArr[filePathArr.length - 1];
};

onBeforeUnmount(() => {
  if (getCurrentPathInterval) {
    clearInterval(getCurrentPathInterval);
    getCurrentPathInterval = undefined;
  }
  actionApi.unregister();
});

const delFile = async (filePath: string) => {
  const includedFileReviewList = reviewList.value.filter(
    (item) => item.selection.file === filePath,
  );

  const unfinishedReviewList = includedFileReviewList.filter(
    (item) =>
      item.state !== ReviewState.Finished && item.state !== ReviewState.Error,
  );
  if (unfinishedReviewList.length > 0) {
    dialog({
      title: i18n('dialog.delFileDialog.title'),
      message: i18n('dialog.delFileDialog.message'),
      persistent: true,
      ok: i18n('dialog.delFileDialog.ok'),
      cancel: i18n('dialog.delFileDialog.cancel'),
    }).onOk(async () => {
      await Promise.all(
        includedFileReviewList.map((item) =>
          windowService.delReview(item.reviewId),
        ),
      );
      getReviewDataList();
    });
  } else {
    await Promise.all(
      includedFileReviewList.map((item) =>
        windowService.delReview(item.reviewId),
      ),
    );
    getReviewDataList();
  }
};

const delReviewItem = async (review: ReviewData) => {
  console.log('delReviewItem', review);
  if (
    review.state !== ReviewState.Finished &&
    review.state !== ReviewState.Error
  ) {
    dialog({
      title: i18n('dialog.delReviewItemDialog.title'),
      message: i18n('dialog.delReviewItemDialog.message'),
      persistent: true,
      ok: i18n('dialog.delReviewItemDialog.ok'),
      cancel: i18n('dialog.delReviewItemDialog.cancel'),
    }).onOk(async () => {
      await windowService.delReview(review.reviewId);
      getReviewDataList();
    });
  } else {
    await windowService.delReview(review.reviewId);
    getReviewDataList();
  }
};

const feedBackHandle = (
  review: ReviewData,
  feedback: Feedback,
  comment?: string,
) => {
  console.log('feedBackHandle', review, feedback, comment);
  windowService.setReviewFeedback({
    serverTaskId: review.serverTaskId,
    feedback,
    comment,
    extraData: review.extraData,
    createTime: DateTime.now().valueOf() / 1000,
  });
};

const retryHandle = (review: ReviewData) => {
  windowService.retryReview(toRaw(review));
};
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
          <q-virtual-scroll
            style="height: 100%"
            :items="fileList"
            separator
            v-slot="{ item }: { item: string }"
          >
            <q-item
              clickable
              v-ripple
              :active="item === activeFile"
              @click="
                () => {
                  activeFile = item;
                }
              "
              :key="item"
              style="padding-left: 6px; padding-right: 0px"
            >
              <q-item-section>
                <div class="file-wrapper">
                  <span class="file-name">
                    {{ getFileName(item) }}
                  </span>
                  <q-tooltip>
                    {{ item }}
                  </q-tooltip>
                  <div class="del-btn-wrapper">
                    <q-btn
                      :title="i18n('labels.delFileTitle')"
                      icon="close"
                      size="xs"
                      flat
                      @click.stop="() => delFile(item)"
                    />
                  </div>
                </div>
              </q-item-section>
            </q-item>
          </q-virtual-scroll>
        </template>

        <template v-slot:after>
          <q-virtual-scroll
            style="height: 100%"
            :items="activeFileReviewList"
            separator
            v-slot="{ item }: { item: ReviewData }"
          >
            <q-expansion-item :key="item.reviewId" expand-separator>
              <template v-slot:header>
                <q-item-section avatar>
                  <q-icon
                    v-if="item.state !== ReviewState.Start"
                    :name="reviewStateIconMap[item.state].icon"
                    :color="reviewStateIconMap[item.state].color"
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
                    `${formatSelection(item.selection).fileName}  ${formatSelection(item.selection).rangeStr}`
                  }}</q-item-section
                >
                <q-item-section side>
                  <q-btn
                    icon="close"
                    size="sm"
                    flat
                    @click.stop="() => delReviewItem(item)"
                  ></q-btn>
                </q-item-section>
              </template>
              <FunctionPanel
                :review-data="item"
                @feedback="
                  (feedback, comment) => feedBackHandle(item, feedback, comment)
                "
                @retry="() => retryHandle(item)"
              />
            </q-expansion-item>
          </q-virtual-scroll>
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

.file-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  .file-name {
    white-space: nowrap;
    text-overflow: ellipsis;
    width: 100%;
    overflow: hidden;
  }
  .del-btn-wrapper {
    display: none;
    position: absolute;
    right: 0px;
    top: -8px;
    height: 100%;
  }
  &:hover {
    .del-btn-wrapper {
      display: block;
    }
  }
}
</style>
