<script setup lang="ts">
import { format } from 'quasar';
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import {
  ActionType,
  UpdateFinishActionMessage,
  UpdateDownloadActionMessage,
} from 'shared/types/ActionMessage';
import { WindowType } from 'shared/types/WindowType';
import { ActionApi } from 'types/ActionApi';
import { UpdateQuery } from 'types/queries';

const baseName = 'pages.UpdatePage.';

const { humanStorageSize } = format;
const { t } = useI18n();
const { matched, query } = useRoute();
const { back } = useRouter();

const i18n = (relativePath: string, data?: Record<string, unknown>) => {
  if (data) {
    return t(baseName + relativePath, data);
  } else {
    return t(baseName + relativePath);
  }
};

const { name } = matched[matched.length - 2];
const { currentVersion, newVersion, releaseDate } = new UpdateQuery(query);

const isUpdating = ref(false);

const progress = reactive({
  total: 0,
  delta: 0,
  transferred: 0,
  percent: 0,
  bytesPerSecond: 0,
});

const updateResponse = (confirmed: boolean) => {
  isUpdating.value = confirmed;
  if (confirmed) {
    window.actionApi.send(new UpdateDownloadActionMessage());
  } else if (name === WindowType.Floating) {
    window.controlApi.hide(WindowType.Floating);
  } else {
    back();
  }
};

const actionApi = new ActionApi(baseName);
onMounted(() => {
  actionApi.register(ActionType.UpdateFinish, () => {
    window.actionApi.send(new UpdateFinishActionMessage());
    if (name === WindowType.Floating) {
      window.controlApi.hide(WindowType.Floating);
    }
  });
  actionApi.register(
    ActionType.UpdateProgress,
    ({ total, delta, transferred, percent, bytesPerSecond }) => {
      progress.total = total;
      progress.delta = delta;
      progress.transferred = transferred;
      progress.percent = percent;
      progress.bytesPerSecond = bytesPerSecond;
    },
  );
});
onBeforeUnmount(() => {
  actionApi.unregister();
});
</script>

<template>
  <q-page class="row justify-evenly q-pa-xl">
    <q-card class="col-grow q-pa-lg">
      <q-card-section class="text-h4 text-center">
        {{ i18n('labels.title') }}
      </q-card-section>
      <q-card-section class="text-body1 q-gutter-y-sm">
        <div class="row q-gutter-x-xs">
          <div>
            {{ i18n('labels.currentVersion') }}
          </div>
          <q-badge>{{ currentVersion }}</q-badge>
        </div>
        <div class="row q-gutter-x-xs">
          <div>
            {{ i18n('labels.newVersion') }}
          </div>
          <q-badge>{{ newVersion }}</q-badge>
        </div>
        <div>
          {{ i18n('labels.releaseDate', { releaseDate }) }}
        </div>
      </q-card-section>
      <q-card-section v-show="isUpdating">
        <q-linear-progress
          rounded
          size="1.5rem"
          :value="progress.percent / 100"
        >
          <div class="absolute-full flex flex-center">
            <q-badge
              color="white"
              text-color="primary"
              :label="`${progress.percent.toFixed(2)}%`"
            />
          </div>
        </q-linear-progress>
        <div class="column q-mt-sm">
          <div>Total size: {{ humanStorageSize(progress.total) }} Byte</div>
          <div>Fragment size: {{ humanStorageSize(progress.delta) }} Byte</div>
          <div>
            Transferred size: {{ humanStorageSize(progress.transferred) }}
          </div>
          <div>Speed: {{ humanStorageSize(progress.bytesPerSecond) }}/s</div>
        </div>
      </q-card-section>
      <q-card-section v-show="!isUpdating">
        <div class="row q-gutter-x-lg">
          <q-btn
            class="col-grow"
            color="secondary"
            flat
            :label="i18n('labels.cancel')"
            @click="updateResponse(false)"
          />
          <q-btn
            class="col-grow"
            color="primary"
            :label="i18n('labels.confirm')"
            @click="updateResponse(true)"
          />
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<style scoped></style>
