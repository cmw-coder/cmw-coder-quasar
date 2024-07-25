<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { bus } from 'boot/bus';
import { ReviewData, ReviewState } from 'shared/types/review';
import { ServiceType } from 'shared/types/service';
import { useService } from 'utils/common';

const { t } = useI18n();
const dataStoreService = useService(ServiceType.DATA_STORE);

const i18n = (relativePath: string) => {
  return t('layouts.drawers.RightReviewHistoryDrawer.' + relativePath);
};

const historyFiles = ref<string[]>([]);
const reviewDataList = ref<ReviewData[]>([]);

const updateHistoryFiles = async () => {
  historyFiles.value = await dataStoreService.getReviewHistoryFiles();
};

const updateReviewDataList = async (historyFile: string) => {
  reviewDataList.value =
    await dataStoreService.getReviewFileContent(historyFile);
};
</script>

<template>
  <q-drawer
    behavior="desktop"
    elevated
    no-swipe-backdrop
    no-swipe-close
    no-swipe-open
    overlay
    side="right"
    @before-show="updateHistoryFiles"
    @show="bus.emit('drawer', 'open', 'right')"
    @hide="bus.emit('drawer', 'close', 'right')"
  >
    <q-list separator>
      <q-item>
        <q-item-section avatar>
          <q-icon color="primary" name="rate_review" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-h6">
            {{ i18n('labels.title') }}
          </q-item-label>
        </q-item-section>
      </q-item>
      <template v-for="historyFile in historyFiles" :key="historyFile">
        <q-expansion-item
          :label="historyFile"
          @before-show="updateReviewDataList(historyFile)"
        >
          <q-list separator>
            <q-item
              v-for="(reviewData, index) in reviewDataList"
              :key="index"
              clickable
              @click="bus.emit('review', reviewData)"
            >
              <q-item-section avatar>
                <q-avatar
                  v-if="reviewData.state === ReviewState.Finished"
                  color="positive"
                  icon="done"
                  size="md"
                  text-color="white"
                />
                <q-avatar
                  v-else
                  color="negative"
                  icon="close"
                  size="md"
                  text-color="white"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label>
                  {{ reviewData.selection.file.split(/[\/\\]/).at(-1) }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                Line {{ reviewData.selection.range.start.line }} -
                {{ reviewData.selection.range.end.line }}
              </q-item-section>
              <q-tooltip>
                {{ reviewData.selection.file }}
              </q-tooltip>
            </q-item>
          </q-list>
        </q-expansion-item>
      </template>
    </q-list>
  </q-drawer>
</template>

<style scoped></style>
