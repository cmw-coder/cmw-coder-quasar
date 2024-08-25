<script lang="ts" setup>
import { onMounted, PropType, ref } from 'vue';
import { Selection } from 'shared/types/Selection';
import { useHighlighter } from 'stores/highlighter';
import { useService } from 'utils/common';
import { ServiceType } from 'shared/types/service';
import { useI18n } from 'vue-i18n';
import { DateTime } from 'luxon';
import {
  ReviewData,
  Feedback,
  Reference,
  ReviewState,
} from 'cmw-coder-subprocess';

const props = defineProps({
  reviewData: {
    type: Object as PropType<ReviewData>,
    required: true,
  },
  feedbackEnabled: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits<{
  (e: 'retry'): void;
  (e: 'feedback', feedback: Feedback, comment?: string): void;
}>();

const isShowCode = ref(false);

const { t } = useI18n();
const baseName = 'components.ReviewPanels.FunctionPanel.';
const i18n = (relativePath: string, data?: Record<string, unknown>) => {
  return data ? t(baseName + relativePath, data) : t(baseName + relativePath);
};
// const appService = useService(ServiceType.App);
const windowService = useService(ServiceType.WINDOW);
const { codeToHtml } = useHighlighter();

const formatSelection = (selection: Selection) => {
  const filePathArr = selection.file.split('\\');
  const fileName = filePathArr[filePathArr.length - 1];
  return {
    fileName,
    rangeStr: `${selection.range.start.line} - ${selection.range.end.line}`,
    ...selection,
  };
};

const formatReference = (reference: Reference) => {
  const filePathArr = reference.path.split('\\');
  const fileName = filePathArr[filePathArr.length - 1];
  return {
    fileName,
    rangeStr: `${reference.range.startLine} - ${reference.range.endLine}`,
    ...reference,
  };
};

const retryHandle = async () => {
  emit('retry');
};

const feedbackHandle = (feedback: Feedback) => {
  emit('feedback', feedback, feedBackComment.value);
};

const feedBackDialogFlag = ref(false);
const feedBackComment = ref('');

const activeReference = ref<Reference | undefined>(undefined);
const viewReferenceDialogFlag = ref(false);
const viewReferenceHandle = (reference: Reference) => {
  activeReference.value = reference;
  viewReferenceDialogFlag.value = true;
};

// const locateFileHandle = (file: string) => {
//   console.log('locate file: ', file);
//   appService.locateFileInFolder(file);
// };

const stopReviewHandle = () => {
  windowService.stopReview(props.reviewData.reviewId);
};

onMounted(() => {
  console.log('FunctionPanel mounted');
});
</script>

<template>
  <div class="review-content bg-blue-grey-2" v-if="reviewData">
    <div class="review-file-wrapper">
      <div class="review-file-content-wrapper">
        <q-card
          class="selection-content-card row"
          style="padding: 0 10px"
          bordered
          flat
        >
          <div class="file-full-path">
            <div>
              <span>{{ reviewData.selection.file }}</span>
              <span style="padding-left: 10px">
                {{ formatSelection(reviewData.selection).rangeStr }}
              </span>
            </div>
            <div>
              <q-btn
                size="sm"
                flat
                @click="
                  () => {
                    isShowCode = !isShowCode;
                  }
                "
                >{{
                  isShowCode ? i18n('labels.collapse') : i18n('labels.expand')
                }}</q-btn
              >
            </div>
          </div>
          <div
            v-if="isShowCode"
            class="review-file-content"
            v-html="
              codeToHtml(
                reviewData.selection.content,
                reviewData.selection.language as any,
              )
            "
          />
        </q-card>
      </div>
    </div>
    <div class="review-step-wrapper">
      <q-timeline v-if="reviewData.state !== ReviewState.Error">
        <q-timeline-entry
          v-if="reviewData.state === ReviewState.Queue"
          :title="i18n('labels.queuing')"
          :subtitle="
            DateTime.fromSeconds(reviewData.createTime).toFormat(
              'yyyy-MM-dd HH:mm:ss',
            )
          "
        >
        </q-timeline-entry>

        <q-timeline-entry
          v-if="reviewData.state !== ReviewState.Queue"
          :title="i18n('labels.referencesTitle')"
          :subtitle="
            DateTime.fromSeconds(reviewData.startTime).toFormat(
              'yyyy-MM-dd HH:mm:ss',
            )
          "
        >
          <q-card
            class="relative-position"
            style="min-height: 80px; max-height: 200px; overflow-y: auto"
          >
            <q-card-section>
              <transition
                appear
                enter-active-class="animated fadeIn"
                leave-active-class="animated fadeOut"
              >
                <q-list
                  bordered
                  separator
                  v-if="reviewData.references.length > 0"
                >
                  <q-item
                    v-for="(reference, index) in reviewData.references"
                    :key="index"
                  >
                    <q-item-section>
                      <q-item-label>
                        <q-chip
                          color="blue-6"
                          text-color="white"
                          :title="
                            i18n('labels.depthTitle', {
                              depth: reference.depth,
                            })
                          "
                          >{{ reference.depth }}</q-chip
                        >
                        <q-chip
                          :title="
                            i18n('labels.typeTitle', {
                              type: reference.type,
                            })
                          "
                          >{{ reference.type }}</q-chip
                        >
                        <span :title="reference.name">{{
                          reference.name
                        }}</span>
                      </q-item-label>
                      <q-item-label
                        caption
                        lines="2"
                        :title="`${reference.path} ${formatReference(reference).rangeStr}`"
                        >{{ formatReference(reference).fileName }}
                        <span style="padding-left: 10px">{{
                          formatReference(reference).rangeStr
                        }}</span>
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side top>
                      <q-item-label caption>
                        <q-btn
                          flat
                          size="sm"
                          @click="() => viewReferenceHandle(reference)"
                          :title="i18n('labels.viewReferenceCodeTitle')"
                          >{{ i18n('labels.viewReferenceCode') }}</q-btn
                        >
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
                <div class="empty" v-else>{{ i18n('labels.empty') }}</div>
              </transition>
            </q-card-section>
            <q-inner-loading
              :showing="reviewData.state === ReviewState.Ready"
              :label="i18n('labels.referenceLoading')"
              label-class="text-teal"
              label-style="font-size: 1.1em"
            />
          </q-card>
        </q-timeline-entry>

        <q-timeline-entry
          :title="i18n('labels.reviewProgressTitle')"
          v-if="
            [ReviewState.Start, ReviewState.First, ReviewState.Second].includes(
              reviewData.state,
            )
          "
          :subtitle="
            DateTime.fromSeconds(reviewData.referenceTime).toFormat(
              'yyyy-MM-dd HH:mm:ss',
            )
          "
        >
          <q-card class="relative-position" style="min-height: 80px">
            <q-list>
              <q-item v-if="reviewData.state === ReviewState.Start">
                <q-item-section avatar>
                  <q-circular-progress
                    indeterminate
                    size="30px"
                    :thickness="0.4"
                    color="lime"
                    track-color="grey-3"
                    center-color="grey-8"
                    class="q-ma-md"
                  />
                </q-item-section>
                <!-- <q-item-section>1/3 AI 正在review</q-item-section> -->
                <q-item-section>{{
                  i18n('labels.reviewStepOne')
                }}</q-item-section>
                <q-item-section avatar>
                  <q-btn
                    :label="i18n('labels.stop')"
                    color="red"
                    @click="() => stopReviewHandle()"
                  />
                </q-item-section>
              </q-item>
              <q-item v-if="reviewData.state === ReviewState.First">
                <q-item-section avatar>
                  <q-circular-progress
                    indeterminate
                    size="30px"
                    :thickness="0.4"
                    color="lime"
                    track-color="grey-3"
                    center-color="grey-8"
                    class="q-ma-md"
                  />
                </q-item-section>
                <!-- <q-item-section
                  >2/3 Reviewer 和 Coder 正在激烈交锋</q-item-section
                > -->
                <q-item-section>{{
                  i18n('labels.reviewStepTwo')
                }}</q-item-section>
                <q-item-section avatar>
                  <q-btn
                    :label="i18n('labels.stop')"
                    color="red"
                    @click="() => stopReviewHandle()"
                  />
                </q-item-section>
              </q-item>
              <q-item v-if="reviewData.state === ReviewState.Second">
                <q-item-section avatar>
                  <q-circular-progress
                    indeterminate
                    size="30px"
                    :thickness="0.4"
                    color="lime"
                    track-color="grey-3"
                    center-color="grey-8"
                    class="q-ma-md"
                  />
                </q-item-section>
                <!-- <q-item-section>3/3 AI 正在总结</q-item-section> -->
                <q-item-section>{{
                  i18n('labels.reviewStepThree')
                }}</q-item-section>
                <q-item-section avatar>
                  <q-btn
                    :label="i18n('labels.stop')"
                    color="red"
                    @click="() => stopReviewHandle()"
                  />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card>
        </q-timeline-entry>
        <q-timeline-entry
          :title="i18n('labels.reviewResultTitle')"
          v-if="reviewData.state === ReviewState.Finished"
          :subtitle="
            DateTime.fromSeconds(reviewData.endTime).toFormat(
              'yyyy-MM-dd HH:mm:ss',
            )
          "
        >
          <q-card v-if="!reviewData.result.parsed">
            <q-card-section style="padding: 4px" class="parsed-error">
              <q-chip color="red-8" class="text-white">{{
                i18n('labels.parsedFailed')
              }}</q-chip>
              <div>{{ reviewData.result.originData }}</div>
            </q-card-section>
          </q-card>
          <template v-else>
            <q-card v-if="reviewData.result.data.length === 0">
              <q-card-section style="padding: 4px" class="parsed-error">
                <q-chip color="blue-6" icon="mdi-check" text-color="white">
                  <div class="empty">{{ i18n('labels.noProblem') }}</div>
                </q-chip>
              </q-card-section>
            </q-card>
            <template v-else>
              <q-card
                bordered
                flat
                class="result-item"
                v-for="(resultItem, index) in reviewData.result.data"
                v-show="resultItem.IsProblem"
                :key="index"
                style="margin-bottom: 10px"
              >
                <q-card-section style="padding: 2px">
                  <q-chip color="red-8" class="text-white">{{
                    resultItem.Type
                  }}</q-chip>
                </q-card-section>
                <q-card-section style="padding: 2px">
                  <div
                    class="code"
                    style="
                      padding: 10px;
                      overflow: auto;
                      border: 1px solid #eee;
                    "
                    v-html="
                      codeToHtml(
                        resultItem.ProblemCodeSnippet,
                        reviewData.selection.language as any,
                      )
                    "
                  />
                </q-card-section>
                <q-card-section style="padding: 2px">{{
                  resultItem.Description
                }}</q-card-section>
              </q-card>
            </template>
          </template>
          <div class="feed-back-wrapper">
            <q-btn
              flat
              align="between"
              :label="i18n('labels.retry')"
              size="md"
              icon="mdi-refresh"
              color="blue-6"
              @click="() => retryHandle()"
            />
            <template v-if="reviewData.feedback === Feedback.None">
              <q-btn
                v-if="feedbackEnabled"
                flat
                align="between"
                :label="i18n('labels.useless')"
                size="md"
                icon="mdi-thumb-down"
                color="grey-6"
                @click="
                  () => {
                    feedBackDialogFlag = true;
                  }
                "
              />

              <q-btn
                v-if="feedbackEnabled"
                flat
                align="between"
                :label="i18n('labels.helpful')"
                size="md"
                icon="mdi-thumb-up"
                color="blue-8"
                @click="() => feedbackHandle(Feedback.Helpful)"
              />
            </template>
            <div v-else class="feed-back-result">
              <q-chip
                :color="
                  reviewData.feedback === Feedback.Helpful ? 'blue-8' : 'grey-6'
                "
                class="text-white"
              >
                {{
                  reviewData.feedback === Feedback.Helpful
                    ? i18n('labels.helpful')
                    : i18n('labels.useless')
                }}
              </q-chip>
            </div>
          </div>
        </q-timeline-entry>
      </q-timeline>
      <q-card style="margin-top: 10px" class="bg-red-8 text-white" v-else>
        <q-card-section>
          <div class="text-h6">{{ i18n('labels.error') }}</div>
          <div class="text-subtitle2">{{ reviewData.errorInfo }}</div>
        </q-card-section>
        <q-separator dark />

        <q-card-actions>
          <q-btn flat @click="() => retryHandle()">{{
            i18n('labels.retry')
          }}</q-btn>
        </q-card-actions>
      </q-card>
    </div>
    <q-dialog v-model="viewReferenceDialogFlag">
      <q-card>
        <q-card-section>
          <div class="text-h6">
            {{ i18n('labels.referenceViewDialogTitle') }}
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div
            v-if="activeReference"
            class="code"
            style="padding: 10px; overflow: auto; border: 1px solid #eee"
            v-html="
              codeToHtml(
                activeReference.content,
                reviewData.selection.language as any,
              )
            "
          />
        </q-card-section>
      </q-card>
    </q-dialog>
    <q-dialog v-model="feedBackDialogFlag" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">{{ i18n('labels.rejectDialogTitle') }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input filled autogrow v-model="feedBackComment" autofocus />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn
            flat
            :label="i18n('labels.rejectDialogCancel')"
            v-close-popup
          />
          <q-btn
            flat
            :label="i18n('labels.rejectDialogConfirm')"
            v-close-popup
            @click="() => feedbackHandle(Feedback.NotHelpful)"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<style scoped lang="scss">
.review-content {
  width: 100%;
  overflow: auto;
  padding: 10px;
  .review-file-wrapper {
    .file-full-path {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .review-file-name-wrapper {
      height: 40px;
      display: flex;
      align-items: center;
      .review-file-range {
        margin-left: 10px;
      }
      .file-operation {
        padding-left: 10px;
      }
    }
  }
  .review-file-content-wrapper {
    .selection-content-card {
      max-height: 400px;
      overflow-y: auto;
    }
  }
  .feed-back-wrapper {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-top: 10px;
  }
}
</style>
