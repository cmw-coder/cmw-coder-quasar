<script lang="ts" setup>
import {
  Feedback,
  ReviewData,
  ReviewFileItem,
  ReviewState,
  reviewStateIconMap,
} from 'cmw-coder-subprocess';
import { DateTime } from 'luxon';
import { QVirtualScroll, throttle, useQuasar } from 'quasar';
import { onBeforeUnmount, onMounted, Ref, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import FunctionPanel from 'components/ReviewPanels/FunctionPanel.vue';
import { ActionType } from 'shared/types/ActionMessage';
import { MainWindowPageType } from 'shared/types/MainWindowPageType';
import { ServiceType } from 'shared/types/service';
import { ActionApi } from 'types/ActionApi';
import { useService } from 'utils/common';
import { formatSelection, getFileName, getProblemNumber } from 'utils/review';

const { dialog } = useQuasar();
const expandedMap = ref({} as Record<string, boolean>);

const baseName = 'pages.ReviewPage.';
const { t } = useI18n();
const websocketService = useService(ServiceType.WEBSOCKET);
const windowService = useService(ServiceType.WINDOW);
const splitterModel = ref<number>(20);
const actionApi = new ActionApi(baseName);

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
  windowService.reviewFile(currentFilePath.value).catch();
};
let getCurrentPathInterval: NodeJS.Timer | undefined = undefined;

const fileListRef = ref(null as unknown as QVirtualScroll);
const activeFileReviewListRef = ref(null as unknown as QVirtualScroll);
const fileList: Ref<ReviewFileItem[]> = ref([]);
const activeFileReviewList: Ref<ReviewData[]> = ref([]);
const activeFile = ref<string>('');
const activeFileReviewListLoading = ref(true);

watch(
  () => activeFile.value,
  async () => {
    try {
      activeFileReviewListLoading.value = true;
      await updateActiveFileReviewList();
    } finally {
      activeFileReviewListLoading.value = false;
    }
  },
);

const isUpdatingFileList = ref(false);
const updateFileList = async () => {
  if (isUpdatingFileList.value) {
    return;
  }
  isUpdatingFileList.value = true;
  console.log('updateFileList');
  fileList.value = await windowService.getReviewFileList();
  isUpdatingFileList.value = false;
  if (!activeFile.value) {
    activeFile.value = fileList.value[0]?.path;
  } else {
    const index = fileList.value.findIndex(
      (item) => item.path === activeFile.value,
    );
    if (index === -1) {
      activeFile.value = fileList.value[0]?.path;
    }
  }
  if (fileList.value.length === 0) {
    activeFileReviewList.value = [];
  }
};

const throttleUpdateFileList = throttle(updateFileList, 1000);

const isUpdatingActiveFileReviewList = ref(false);
const updateActiveFileReviewList = async () => {
  if (isUpdatingActiveFileReviewList.value) {
    return;
  }
  isUpdatingActiveFileReviewList.value = true;
  console.log('updateActiveFileReviewList');
  if (!activeFile.value) {
    activeFileReviewList.value = [];
  } else {
    activeFileReviewList.value = await windowService.getFileReviewList(
      activeFile.value,
    );
  }
  isUpdatingActiveFileReviewList.value = false;
};

const updateReviewData = (reviewIdList: string[]) => {
  console.log('updateReviewData', reviewIdList.length);
  const includedFileReviewList = activeFileReviewList.value.filter((review) => {
    return reviewIdList.includes(review.reviewId);
  });
  if (includedFileReviewList.length > 0) {
    updateActiveFileReviewList();
  }
  throttleUpdateFileList();
};

onMounted(async () => {
  currentFilePath.value = await websocketService.getCurrentFile();
  getCurrentPathInterval = setInterval(async () => {
    currentFilePath.value = await websocketService.getCurrentFile();
  }, 500);

  updateFileList().catch();
  actionApi.register(ActionType.ReviewFileListUpdate, () => {
    throttleUpdateFileList();
  });

  actionApi.register(ActionType.ReviewDataUpdate, (reviewIdList) => {
    updateReviewData(reviewIdList);
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

const delFile = async (fileItem: ReviewFileItem) => {
  const includedFileReviewList = await windowService.getFileReviewList(
    fileItem.path,
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
      await windowService.delReviewByFile(fileItem.path);
      updateFileList().catch();
    });
  } else {
    await windowService.delReviewByFile(fileItem.path);
    updateFileList().catch();
  }
};

const delReviewItem = async (review: ReviewData) => {
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
      const delReviewIndex = activeFileReviewList.value.findIndex(
        (item) => item.reviewId === review.reviewId,
      );
      if (delReviewIndex !== -1) {
        activeFileReviewList.value.splice(delReviewIndex, 1);
      }
      updateFileList().catch();
    });
  } else {
    await windowService.delReview(review.reviewId);
    const delReviewIndex = activeFileReviewList.value.findIndex(
      (item) => item.reviewId === review.reviewId,
    );
    if (delReviewIndex !== -1) {
      activeFileReviewList.value.splice(delReviewIndex, 1);
    }
    updateFileList().catch();
  }
};

const feedBackHandle = async (
  review: ReviewData,
  feedback: Feedback,
  comment?: string,
) => {
  const configService = useService(ServiceType.CONFIG);
  const username = await configService.getConfig('username');
  console.log('feedBackHandle', {
    serverTaskId: review.serverTaskId,
    userId: username || 'NONE',
    feedback,
    comment: comment || '',
    timestamp: DateTime.now().valueOf() / 1000,
  });
  windowService
    .setReviewFeedback({
      serverTaskId: review.serverTaskId,
      userId: username || 'NONE',
      feedback,
      comment: comment || '',
      timestamp: DateTime.now().valueOf() / 1000,
    })
    .catch();
};

const retryHandle = (review: ReviewData) => {
  windowService.retryReview(review.reviewId);
};

const projectReview = () => {
  windowService.reviewProject(currentFilePath.value);
};

const clearReview = () => {
  dialog({
    title: i18n('dialog.clearReviewDialog.title'),
    message: i18n('dialog.clearReviewDialog.message'),
    persistent: true,
    ok: i18n('dialog.clearReviewDialog.ok'),
    cancel: i18n('dialog.clearReviewDialog.cancel'),
  }).onOk(async () => {
    await windowService.clearReview();
    fileList.value = [];
    activeFileReviewList.value = [];
  });
};
</script>

<template>
  <q-page style="height: 100%">
    <div class="current-file">
      <q-list bordered>
        <q-item v-if="false">
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
              size="md"
              color="primary"
              unelevated
              :disable="!currentFilePath"
              :label="i18n('labels.reviewFile')"
              @click="() => startCurrentFileReview()"
            />
          </q-item-section>
          <q-item-section side>
            <q-btn
              color="primary"
              size="md"
              unelevated
              :label="i18n('labels.projectReview')"
              @click="() => projectReview()"
            />
          </q-item-section>
          <q-item-section side>
            <q-btn
              v-if="fileList.length > 10"
              color="primary"
              size="md"
              unelevated
              :label="i18n('labels.clear')"
              @click="() => clearReview()"
            />
          </q-item-section>
        </q-item>
      </q-list>
    </div>
    <div class="rest-content">
      <q-splitter v-model="splitterModel" style="height: 100%">
        <template v-slot:before>
          <q-virtual-scroll
            ref="fileListRef"
            style="height: 100%"
            :items="fileList"
            separator
            v-slot="{ item }: { item: ReviewFileItem }"
          >
            <q-item
              clickable
              v-ripple
              dense
              :active="item.path === activeFile"
              @click="
                () => {
                  activeFile = item.path;
                }
              "
              :key="item.path"
              style="padding-left: 6px; padding-right: 0"
            >
              <q-item-section>
                <div class="file-wrapper">
                  <span class="file-name">
                    {{ getFileName(item.path) }}
                  </span>
                  <span class="rest-item">
                    {{ item.done }} / {{ item.total }}
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
          <q-inner-loading
            :showing="activeFileReviewListLoading"
            :label="i18n('labels.loading')"
            label-class="text-teal"
            label-style="font-size: 1.1em"
          />
          <q-virtual-scroll
            v-if="!activeFileReviewListLoading"
            ref="activeFileReviewListRef"
            style="height: 100%"
            :items="activeFileReviewList"
            separator
            v-slot="{ item }: { item: ReviewData }"
          >
            <q-expansion-item
              :key="item.reviewId"
              dense
              expand-separator
              :model-value="!!expandedMap[item.reviewId]"
              @hide="
                () => {
                  expandedMap[item.reviewId] = false;
                }
              "
              @show="
                () => {
                  expandedMap[item.reviewId] = true;
                }
              "
            >
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
                    `${formatSelection(item.selectionData).fileName}  ${formatSelection(item.selectionData).rangeStr}`
                  }}</q-item-section
                >
                <q-item-section side>
                  <div
                    style="
                      width: 74px;
                      display: flex;
                      justify-content: flex-end;
                    "
                  >
                    <q-chip
                      v-show="getProblemNumber(item) > 0"
                      color="red-6"
                      class="text-white"
                      style="width: 22px"
                      dense
                    >
                      {{ getProblemNumber(item) }}
                    </q-chip>
                    <q-btn
                      icon="close"
                      size="sm"
                      flat
                      @click.stop="() => delReviewItem(item)"
                    ></q-btn>
                  </div>
                </q-item-section>
              </template>
              <template v-slot:default>
                <FunctionPanel
                  v-if="expandedMap[item.reviewId]"
                  :review-data="item"
                  @feedback="
                    (feedback, comment) =>
                      feedBackHandle(item, feedback, comment)
                  "
                  @retry="() => retryHandle(item)"
                />
              </template>
            </q-expansion-item>
          </q-virtual-scroll>
        </template>
      </q-splitter>
    </div>
  </q-page>
</template>

<style lang="scss" scoped>
.rest-content {
  // height: calc(100% - 54px);
  height: calc(100% - 2px);
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
    width: calc(100% - 40px);
    overflow: hidden;
  }
  .rest-item {
    font-size: 10px;
  }
  .del-btn-wrapper {
    display: none;
    position: absolute;
    right: 0;
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
