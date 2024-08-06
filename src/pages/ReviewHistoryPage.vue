<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';
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
// import { useRouter } from 'vue-router';

const windowService = useService(ServiceType.WINDOW);
// const router = useRouter();
const expandedMap = ref({} as Record<string, boolean>);

const formatSelection = (selection: Selection) => {
  const filePathArr = selection.file.split(/\\|\//);
  const fileName = filePathArr[filePathArr.length - 1];
  return {
    fileName,
    rangeStr: `${selection.range.start.line} - ${selection.range.end.line}`,
    ...selection,
  };
};

const getProblemNumber = (review: ReviewData) => {
  let result = 0;
  if (review.state === ReviewState.Finished) {
    if (review?.result?.parsed) {
      review.result.data.forEach((item) => {
        if (item.IsProblem) {
          result += 1;
        }
      });
    }
  }
  return result;
};

const getFileName = (filePath: string) => {
  const filePathArr = filePath.split(/\\|\//);
  return filePathArr[filePathArr.length - 1];
};

const splitterModel = ref<number>(20);

const selectedDate = ref('');
const dateList = ref<string[]>([]);
const reviewList = ref<ReviewData[]>([]);

const getReviewDateList = async () => {
  const data = await windowService.getReviewHistoryFiles();
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
    reviewList.value = await windowService.getReviewFileContent(
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
  console.log('retryHandle', review);
  // await windowService.retryReview(toRaw(review));
  // router.back();
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
          <q-virtual-scroll
            style="height: 100%"
            :items="fileList"
            separator
            v-slot="{ item }: { item: string }"
          >
            <q-item
              clickable
              v-ripple
              dense
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
            <q-expansion-item
              dense
              :key="item.reviewId"
              :model-value="!!expandedMap[item.reviewId]"
              expand-separator
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
                    `${formatSelection(item.selection).fileName}  ${formatSelection(item.selection).rangeStr}`
                  }}</q-item-section
                >
                <q-item-section side>
                  <q-chip
                    color="red-6"
                    class="text-white"
                    style="width: 22px"
                    dense
                  >
                    {{ getProblemNumber(item) }}
                  </q-chip>
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
