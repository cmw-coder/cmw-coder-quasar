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
  }
  currentFilePath.value = await websocketService.getCurrentFile();
  getCurrentPathInterval.value = window.setInterval(async () => {
    currentFilePath.value = await websocketService.getCurrentFile();
  }, 100);

  actionApi.register(ActionType.ReviewDataUpdate, ({ type, data }) => {
    if (type === ReviewType.Function) {
      functionReviewData.value = data;
    } else {
      fileReviewData.value = data;
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
                @click="windowService.reviewFile(currentFilePath!)"
              />
            </q-item-section>
          </q-item>
        </q-list>
        <div v-if="currentReviewType === ReviewType.File && fileReviewData">
          <q-expansion-item>
            <template v-slot:header>
              <q-item-section>
                <q-linear-progress
                  size="25px"
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
