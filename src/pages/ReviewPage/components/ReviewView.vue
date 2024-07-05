<script lang="ts" setup>
import { PropType } from 'vue';
import { Selection } from 'shared/types/Selection';
import { useHighlighter } from 'stores/highlighter';
import {
  Reference,
  ReviewData,
  ReviewState,
  Feedback,
} from 'shared/types/review';

defineProps({
  reviewData: {
    type: Object as PropType<ReviewData>,
    required: true,
  },
});

const emit = defineEmits<{
  (e: 'retry'): void;
  (e: 'feedback', feedback: Feedback): void;
}>();

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
    rangeStr: `${reference.range.begin} - ${reference.range.end}`,
    ...reference,
  };
};

const retryHandle = async () => {
  emit('retry');
};

const feedbackHandle = (feedback: Feedback) => {
  emit('feedback', feedback);
};
</script>

<template>
  <div class="review-content" v-if="reviewData">
    <div class="review-file-wrapper">
      <div class="review-file-name-wrapper">
        <div
          class="review-file text-bold text-grey text-h8"
          :title="`${reviewData.selection.file} ${formatSelection(reviewData.selection).rangeStr}`"
        >
          <span class="review-file-name">{{
            formatSelection(reviewData.selection).fileName
          }}</span>
          <span class="review-file-range">{{
            formatSelection(reviewData.selection).rangeStr
          }}</span>
        </div>
        <div class="file-operation">view</div>
      </div>
      <div class="review-file-content-wrapper">
        <q-card
          class="selection-content-card row"
          style="padding: 0 10px"
          bordered
          flat
        >
          <div
            class="review-file-content"
            v-html="
              codeToHtml(
                reviewData.selection.content,
                reviewData.selection.language,
              )
            "
          />
        </q-card>
      </div>
    </div>
    <div class="review-step-wrapper">
      <q-timeline v-if="reviewData.state !== ReviewState.Error">
        <q-timeline-entry title="Find References">
          <q-card
            class="relative-position"
            style="min-height: 80px; max-height: 200px"
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
                      <q-item-label :title="reference.content">
                        <q-chip>{{ reference.type }}</q-chip>
                        <span>{{ reference.name }}</span>
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
                        <q-btn flat size="sm">view</q-btn>
                        <q-btn flat size="sm">locate</q-btn>
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
                <div class="empty" v-else>Empty</div>
              </transition>
            </q-card-section>
            <q-inner-loading
              :showing="reviewData.state === ReviewState.References"
              label="Finding References..."
              label-class="text-teal"
              label-style="font-size: 1.1em"
            />
          </q-card>
        </q-timeline-entry>

        <q-timeline-entry
          title="Review Progress"
          v-if="
            [ReviewState.Start, ReviewState.First, ReviewState.Second].includes(
              reviewData.state,
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
                <q-item-section>1/3 Review</q-item-section>
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
                <q-item-section>2/3 Review</q-item-section>
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
                <q-item-section>3/3 Review</q-item-section>
              </q-item>
            </q-list>
          </q-card>
        </q-timeline-entry>
        <q-timeline-entry
          title="Review Result"
          v-if="reviewData.state === ReviewState.Finished"
        >
          <q-card style="padding: 10px">
            {{ reviewData.result }}
          </q-card>
          <div class="feed-back-wrapper">
            <q-btn
              flat
              align="between"
              label="retry"
              size="md"
              icon="mdi-refresh"
              color="blue-6"
              @click="() => retryHandle()"
            />
            <template v-if="reviewData.feedback === Feedback.None">
              <q-btn
                flat
                align="between"
                label="useless"
                size="md"
                icon="mdi-thumb-down"
                color="grey-6"
                @click="() => feedbackHandle(Feedback.NotHelpful)"
              />

              <q-btn
                flat
                align="between"
                label="helpful"
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
                {{ reviewData.feedback }}
              </q-chip>
            </div>
          </div>
        </q-timeline-entry>
      </q-timeline>
      <q-card style="margin-top: 10px" class="bg-red-8 text-white" v-else>
        <q-card-section>
          <div class="text-h6">Error</div>
          <div class="text-subtitle2">{{ reviewData.errorInfo }}</div>
        </q-card-section>
        <q-separator dark />

        <q-card-actions>
          <q-btn flat @click="() => retryHandle()">Retry</q-btn>
        </q-card-actions>
      </q-card>
    </div>
  </div>
</template>

<style scoped lang="scss">
.review-content {
  height: calc(100% - 50px);
  width: 100%;
  overflow: auto;
  padding: 10px;
  .review-file-wrapper {
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