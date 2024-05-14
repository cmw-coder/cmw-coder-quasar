<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import ProjectIdInput from 'components/ProjectIdInput.vue';
import { WindowType } from 'shared/types/WindowType';
import { useService } from 'utils/common';
import { ServiceType } from 'shared/services';
import { useQuasar } from 'quasar';
import { DateTime } from 'luxon';

const { t } = useI18n();

const { notify } = useQuasar();

const dataStoreService = useService(ServiceType.DATA_STORE);
const windowService = useService(ServiceType.WINDOW);

const i18n = (relativePath: string, data?: Record<string, unknown>) => {
  if (data) {
    return t('pages.ProjectIdPage.' + relativePath, data);
  } else {
    return t('pages.ProjectIdPage.' + relativePath);
  }
};

const error = ref(false);
const isLoading = ref(false);
const projectId = ref('');
const project = ref('');

const finish = () => {
  windowService.closeWindow(WindowType.ProjectId);
};

const checkProjectId = async () => {
  isLoading.value = true;
  const activeProject = await windowService.getProjectIdWindowActiveProject();
  if (!activeProject) {
    notify({
      type: 'warning',
      message: i18n('errors.noProject'),
    });
    return;
  }
  project.value = activeProject;
  await dataStoreService.setProjectId(activeProject, projectId.value);
  setTimeout(() => {
    isLoading.value = false;
    finish();
  }, 1000);
};

const temporaryProjectId = async () => {
  isLoading.value = true;
  const activeProject = await windowService.getProjectIdWindowActiveProject();
  if (!activeProject) {
    notify({
      type: 'warning',
      message: i18n('errors.noProject'),
    });
    return;
  }
  project.value = activeProject;
  await dataStoreService.setProjectId(
    activeProject,
    `Temp_${DateTime.now().toFormat('yyyyLLdd_HHmmss')}`,
  );
  setTimeout(() => {
    isLoading.value = false;
    finish();
  }, 1000);
};

onMounted(async () => {});
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
