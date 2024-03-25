<script setup lang="ts">
import { DateTime } from 'luxon';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import ProjectIdInput from 'components/ProjectIdInput.vue';
import { WindowType } from 'shared/types/WindowType';
import { ProjectIdQuery } from 'types/queries';
import { ClientSetProjectIdActionMessage } from 'shared/types/ActionMessage';

const { t } = useI18n();
const { matched, query } = useRoute();

const i18n = (relativePath: string, data?: Record<string, unknown>) => {
  if (data) {
    return t('pages.ProjectIdPage.' + relativePath, data);
  } else {
    return t('pages.ProjectIdPage.' + relativePath);
  }
};

const { name } = matched[matched.length - 2];
const { project } = new ProjectIdQuery(query);

const error = ref(false);
const isLoading = ref(false);
const projectId = ref('');

const finish = () => {
  if (name === WindowType.Floating) {
    window.controlApi.close(WindowType.Floating);
  }
};

const checkProjectId = async () => {
  isLoading.value = true;
  window.actionApi.send(
    new ClientSetProjectIdActionMessage({
      project,
      projectId: projectId.value,
    }),
  );
  setTimeout(() => {
    isLoading.value = false;
    finish();
  }, 1000);
};

const temporaryProjectId = () => {
  isLoading.value = true;
  window.actionApi.send(
    new ClientSetProjectIdActionMessage({
      project,
      projectId: `Temp_${DateTime.now().toFormat('yyyyLLdd_HHmmss')}`,
    }),
  );
  setTimeout(() => {
    isLoading.value = false;
    finish();
  }, 1000);
};
</script>

<template>
  <q-page class="row flex-center q-pa-lg">
    <div class="col-10 column q-gutter-y-sm">
      <div class="q-gutter-y-lg">
        <div class="text-bold text-center text-h3">
          {{ i18n('labels.title') }}
        </div>
      </div>
      <div class="column q-gutter-y-sm">
        <div
          class="text-center text-grey text-h6"
          style="white-space: pre-line"
        >
          {{ i18n('labels.intro') }}
        </div>
        <div
          class="text-center text-grey text-italic text-subtitle1"
          style="white-space: pre-line"
        >
          {{ i18n('labels.description', { project }) }}
        </div>
        <project-id-input v-model="projectId" @update:error="error = $event" />
        <q-btn
          color="primary"
          :disable="!projectId || !projectId.length || error"
          :label="i18n('labels.confirm')"
          :loading="isLoading"
          @click="checkProjectId"
        />
        <q-btn
          color="primary"
          flat
          :label="i18n('labels.temporary')"
          :loading="isLoading"
          @click="temporaryProjectId"
        />
      </div>
    </div>
  </q-page>
</template>

<style scoped></style>
