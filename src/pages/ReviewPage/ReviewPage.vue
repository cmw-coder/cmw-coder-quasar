<script lang="ts" setup>
// import { useQuasar } from 'quasar';
import { PropType, onBeforeUnmount, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { ServiceType } from 'shared/types/service';
import { WindowType } from 'shared/types/WindowType';
import { useService } from 'utils/common';
import { ReviewData, Feedback } from 'shared/types/review';
import { ActionApi } from 'types/ActionApi';
import { ActionType } from 'shared/types/ActionMessage';
import ReviewHistory from 'pages/ReviewPage/components/ReviewHistory.vue';
import ReviewView from 'pages/ReviewPage/components/ReviewView.vue';
import { MainWindowPageType } from 'shared/types/MainWindowPageType';

const props = defineProps({
  windowType: {
    type: String as PropType<WindowType>,
    default: WindowType.Main,
  },
});

const windowService = useService(ServiceType.WINDOW);

const reviewData = ref<ReviewData | undefined>(undefined);

const { t } = useI18n();
// const { notify } = useQuasar();
// const configService = useService(ServiceType.CONFIG);
// const windowService = useService(ServiceType.WINDOW);

const baseName = 'pages.ReviewPage.';
const actionApi = new ActionApi(baseName);

const i18n = (relativePath: string) => {
  return t(baseName + relativePath);
};

// const currentFile = ref<string>('');

onMounted(async () => {
  console.log('ReviewPage mounted', props.windowType);
  reviewData.value = await windowService.getReviewData();

  actionApi.register(ActionType.ReviewDataUpdate, (data) => {
    reviewData.value = data;
  });

  actionApi.register(ActionType.MainWindowCheckPageReady, (type) => {
    if (type === MainWindowPageType.Review) {
      windowService.setMainWindowPageReady(MainWindowPageType.Review);
    }
  });
});

const feedbackHandle = (feedback: Feedback) => {
  if (reviewData.value) {
    reviewData.value.feedback = feedback;
    windowService.setActiveReviewFeedback(feedback);
  }
};

const retryHandle = async () => {
  windowService.retryActiveReview();
  reviewData.value = await windowService.getReviewData();
};

onBeforeUnmount(() => {
  actionApi.unregister();
});
</script>

<template>
  <div class="review-wrapper">
    <div class="review-header">
      <div class="title text-bold text-h6">
        {{ i18n('labels.title') }}
      </div>
      <div class="operation">
        <ReviewHistory />
      </div>
    </div>
    <ReviewView
      v-if="reviewData"
      :review-data="reviewData"
      @retry="retryHandle"
      @feedback="feedbackHandle"
    />
  </div>
</template>

<style lang="scss" scoped>
.review-wrapper {
  height: 100%;
  width: 100%;
  position: relative;
  overflow: hidden;
  .review-header {
    height: 50px;
    display: flex;
    z-index: 100;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    padding: 0 10px;
    border-bottom: 1px solid #eee;
  }
}
</style>
