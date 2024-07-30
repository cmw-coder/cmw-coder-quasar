<script lang="ts" setup>
import { computed, onMounted, ref, toRaw, watch } from 'vue';
import { useService } from 'utils/common';
import { ServiceType } from 'shared/types/service';
import {
  Feedback,
  ReviewData,
  ReviewState,
  reviewStateIconMap,
} from 'shared/types/review';
import { Selection } from 'shared/types/Selection';
import FunctionPanel from 'components/ReviewPanels/FunctionPanel.vue';
import { DateTime } from 'luxon';
import { useRouter } from 'vue-router';

const windowService = useService(ServiceType.WINDOW);
const router = useRouter();

const formatSelection = (selection: Selection) => {
  const filePathArr = selection.file.split(/\\|\//);
  const fileName = filePathArr[filePathArr.length - 1];
  return {
    fileName,
    rangeStr: `${selection.range.start.line} - ${selection.range.end.line}`,
    ...selection,
  };
};
const getFileName = (filePath: string) => {
  const filePathArr = filePath.split(/\\|\//);
  return filePathArr[filePathArr.length - 1];
};

const splitterModel = ref<number>(20);

const dataStoreService = useService(ServiceType.DATA_STORE);

const selectedDate = ref('');
const dateList = ref<string[]>([]);
const reviewList = ref<ReviewData[]>([]);

const getReviewDateList = async () => {
  const data = await dataStoreService.getReviewHistoryFiles();
  dateList.value = data.sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime(),
  );
  if (selectedDate.value === '') selectedDate.value = dateList.value[0];
};

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

watch(
  () => selectedDate.value,
  async () => {
    if (selectedDate.value === '') return;
    reviewList.value = await dataStoreService.getReviewFileContent(
      selectedDate.value,
    );
    activeFile.value = fileList.value[0];
  },
);

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
  review.feedback = feedback;
};

const retryHandle = async (review: ReviewData) => {
  await windowService.retryReview(toRaw(review));
  router.back();
};

onMounted(() => {
  getReviewDateList();
});
</script>

<template>
  <q-page style="height: 100%">
    <div class="selected-date">
      <q-list bordered>
        <q-item>
          <q-item-section>
            <q-select
              v-model="selectedDate"
              :options="dateList"
              dense
              label="Select Review Date"
            ></q-select>
          </q-item-section>
        </q-item>
      </q-list>
    </div>
    <div class="rest-content">
      <q-splitter v-model="splitterModel" style="height: 100%">
        <template v-slot:before>
          <q-list
            padding
            separator
            class="text-primary full-height"
            style="padding-top: 0px"
          >
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
              style="padding-left: 6px; padding-right: 0px"
            >
              <q-item-section>
                <div class="file-wrapper">
                  <span class="file-name">
                    {{ getFileName(file) }}
                  </span>
                  <q-tooltip>
                    {{ file }}
                  </q-tooltip>
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </template>

        <template v-slot:after>
          <q-list
            padding
            separator
            class="text-primary full-height"
            style="padding-top: 0px"
          >
            <q-expansion-item
              v-for="review in activeFileReviewList"
              :key="review.reviewId"
              expand-separator
            >
              <template v-slot:header>
                <q-item-section avatar>
                  <q-icon
                    v-if="review.state !== ReviewState.Start"
                    :name="reviewStateIconMap[review.state].icon"
                    :color="reviewStateIconMap[review.state].color"
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
              <FunctionPanel
                :review-data="review"
                @feedback="
                  (feedback, comment) =>
                    feedBackHandle(review, feedback, comment)
                "
                @retry="() => retryHandle(review)"
              />
            </q-expansion-item>
          </q-list>
        </template>
      </q-splitter>
    </div>
  </q-page>
</template>

<style lang="scss" scoped>
.rest-content {
  height: calc(100% - 58px);
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
