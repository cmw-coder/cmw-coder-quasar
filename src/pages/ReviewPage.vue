<script lang="ts" setup>
// import { useQuasar } from 'quasar';
import { PropType, onBeforeUnmount, onMounted, ref, computed } from 'vue';

import { bus } from 'boot/bus';
import FunctionPanel from 'components/ReviewPanels/FunctionPanel.vue';
import { ServiceType } from 'shared/types/service';
import { WindowType } from 'shared/types/WindowType';
import {
  ReviewData,
  Feedback,
  ReviewType,
  ReviewState,
} from 'shared/types/review';
import { ActionType } from 'shared/types/ActionMessage';
import { MainWindowPageType } from 'shared/types/MainWindowPageType';
import { ActionApi } from 'types/ActionApi';
import { useService } from 'utils/common';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  windowType: {
    type: String as PropType<WindowType>,
    default: WindowType.Main,
  },
});

const baseName = 'pages.ReviewPage.';
const { t } = useI18n();
const windowService = useService(ServiceType.WINDOW);
const websocketService = useService(ServiceType.WEBSOCKET);

const i18n = (relativePath: string, data?: Record<string, unknown>) => {
  if (data) {
    return t(baseName + relativePath, data);
  } else {
    return t(baseName + relativePath);
  }
};

const fileReviewData = ref<ReviewData[]>([]);
const functionReviewData = ref<ReviewData>();
const currentReviewType = ref<ReviewType>(ReviewType.Function);
const currentFilePath = ref<string>();
const getCurrentPathInterval = ref(0);

const completedFileReviewDataCount = computed(() => {
  return fileReviewData.value.filter((task) =>
    [ReviewState.Error, ReviewState.Finished].includes(task.state),
  ).length;
});
const runningFileReviewDataCount = computed(() => {
  return fileReviewData.value.filter(
    (task) =>
      ![
        ReviewState.References,
        ReviewState.Error,
        ReviewState.Finished,
      ].includes(task.state),
  ).length;
});

bus.on('review', (data) => {
  currentReviewType.value = ReviewType.Function;
  functionReviewData.value = data;
});

const startFileReview = async () => {
  if (currentFilePath.value) {
    currentReviewType.value = ReviewType.File;
    await windowService.reviewFile(currentFilePath.value);
    fileReviewData.value = await windowService.getReviewData(
      currentReviewType.value,
    );
  }
};

const feedbackHandle = (feedback: Feedback, comment?: string) => {
  if (functionReviewData.value) {
    functionReviewData.value.feedback = feedback;
    windowService.setActiveReviewFeedback(feedback, comment);
  }
};

const retryHandle = async () => {
  windowService.retryActiveReview().catch();
  if (currentReviewType.value === ReviewType.Function) {
    functionReviewData.value = await windowService.getReviewData(
      currentReviewType.value,
    );
  }
};

const actionApi = new ActionApi(baseName);
onMounted(async () => {
  console.log('ReviewPage mounted', props.windowType);
  if (currentReviewType.value === ReviewType.Function) {
    functionReviewData.value = await windowService.getReviewData(
      currentReviewType.value,
    );
  } else {
    fileReviewData.value = await windowService.getReviewData(
      currentReviewType.value,
    );
  }

  currentFilePath.value = await websocketService.getCurrentFile();
  getCurrentPathInterval.value = window.setInterval(async () => {
    currentFilePath.value = await websocketService.getCurrentFile();
  }, 100);

  actionApi.register(ActionType.ReviewDataUpdate, ({ type, data, index }) => {
    if (type === ReviewType.Function) {
      functionReviewData.value = data;
    } else {
      fileReviewData.value[index] = data;
    }
  });

  actionApi.register(ActionType.MainWindowCheckPageReady, (type) => {
    if (type === MainWindowPageType.Review) {
      windowService.setMainWindowPageReady(MainWindowPageType.Review);
    }
  });
});
onBeforeUnmount(() => {
  window.clearInterval(getCurrentPathInterval.value);
  actionApi.unregister();
});
</script>

<template>
  <q-page class="flex">
    <div class="col-grow column justify-start">
      <div>
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
                @click="startFileReview"
              />
            </q-item-section>
          </q-item>
        </q-list>
        <div
          v-if="currentReviewType === ReviewType.File && fileReviewData"
          class="column"
        >
          <q-item>
            <q-item-section>
              <q-item-label class="text-h6"> 正在进行文件评审： </q-item-label>
            </q-item-section>
          </q-item>
          <q-expansion-item>
            <template v-slot:header>
              <q-item-section>
                <q-linear-progress
                  size="30px"
                  color="primary"
                  rounded
                  :buffer="
                    (completedFileReviewDataCount +
                      runningFileReviewDataCount) /
                    fileReviewData.length
                  "
                  :value="completedFileReviewDataCount / fileReviewData.length"
                >
                  <div class="absolute-full flex flex-center">
                    <q-badge
                      color="accent"
                      text-color="white"
                      :label="`${completedFileReviewDataCount}/${fileReviewData.length}`"
                    />
                  </div>
                </q-linear-progress>
              </q-item-section>
            </template>
            <q-list bordered separator>
              <q-item v-for="(task, index) in fileReviewData" :key="index">
                <q-item-section avatar>
                  <q-avatar
                    v-if="task.state === ReviewState.References"
                    color="grey"
                    icon="schedule"
                    size="md"
                    text-color="white"
                  />
                  <q-avatar
                    v-else-if="task.state === ReviewState.Error"
                    color="negative"
                    icon="close"
                    size="md"
                    text-color="white"
                  />
                  <q-avatar
                    v-else-if="task.state === ReviewState.Finished"
                    color="positive"
                    icon="done"
                    size="md"
                    text-color="white"
                  />
                  <q-avatar v-else color="amber" size="md">
                    <q-spinner color="white" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>
                    {{
                      task.selection.content.match(/\b([a-zA-z0-9]*)\b\(/)?.[1]
                    }}
                  </q-item-label>
                  <q-item-label caption>
                    Line {{ task.selection.range.start.line }} -
                    {{ task.selection.range.end.line }}
                  </q-item-label>
                </q-item-section>
                <!--                <q-item-section side>-->
                <!--                  <q-btn-->
                <!--                    v-if="task.state === ReviewState.References"-->
                <!--                    color="primary"-->
                <!--                    unelevated-->
                <!--                    :label="i18n('labels.review')"-->
                <!--                    @click="windowService.reviewFile(currentFilePath, index)"-->
                <!--                  />-->
                <!--                  <q-btn-->
                <!--                    v-else-if="task.state === ReviewState.Error"-->
                <!--                    color="negative"-->
                <!--                    unelevated-->
                <!--                    :label="i18n('labels.retry')"-->
                <!--                    @click="windowService.retryFileReview(index)"-->
                <!--                  />-->
                <!--                  <q-btn-->
                <!--                    v-else-if="task.state === ReviewState.Finished"-->
                <!--                    color="positive"-->
                <!--                    unelevated-->
                <!--                    :label="i18n('labels.feedback')"-->
                <!--                    @click="windowService.setActiveReviewFeedback(task)"-->
                <!--                  />-->
                <!--                </q-item-section>-->
              </q-item>
            </q-list>
          </q-expansion-item>
        </div>
        <FunctionPanel
          v-else-if="
            currentReviewType === ReviewType.Function && functionReviewData
          "
          class="col-grow"
          :review-data="functionReviewData"
          @retry="retryHandle"
          @feedback="feedbackHandle"
        />
      </div>
    </div>
  </q-page>
</template>

<style lang="scss" scoped></style>
