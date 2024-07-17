<script setup lang="ts">
import { useService } from 'utils/common';
import { ServiceType } from 'shared/types/service';
import { computed, onMounted, reactive, ref, toRaw } from 'vue';
import { DataProjectType } from 'shared/types/service/DataStoreServiceTrait/types';
import { useQuasar } from 'quasar';
import ProjectIdInput from 'components/ProjectIdInput.vue';
import { useI18n } from 'vue-i18n';

const dataStoreService = useService(ServiceType.DATA_STORE);
const { dialog } = useQuasar();
const baseName = 'components.SettingCards.ProjectIdCard.';
const { t } = useI18n({ useScope: 'global' });

const i18n = (relativePath: string, data?: Record<string, unknown>) => {
  if (data) {
    return t(baseName + relativePath, data);
  } else {
    return t(baseName + relativePath);
  }
};

const loading = ref(false);
const projectData = ref<undefined | Record<string, DataProjectType>>();
const projectList = computed(() => {
  return Object.keys(projectData.value || {});
});

const editFlag = ref(false);
const editProject = reactive({
  project: '',
  id: '',
});
const error = ref(false);

const refreshHandle = async () => {
  loading.value = true;
  const appData = await dataStoreService.getAppDataAsync();
  projectData.value = appData.project;
  loading.value = false;
};

const editProjectHandle = (project: string) => {
  if (!projectData.value) {
    return;
  }
  editFlag.value = true;
  const projectItem = projectData.value[project];
  editProject.id = projectItem.id;
  editProject.project = project;
};

const confirmEdit = async () => {
  if (!projectData.value) {
    return;
  }
  const originData: Record<string, DataProjectType> = JSON.parse(
    JSON.stringify(toRaw(projectData.value)),
  );
  originData[editProject.project].id = editProject.id;
  await dataStoreService.setAppDataAsync('project', originData);
  await refreshHandle();
};

const delProjectHandle = (project: string) => {
  if (!projectData.value) {
    return;
  }
  dialog({
    title: i18n('labels.delDialogTitle'),
    message: i18n('labels.delDialogMessage'),
    persistent: true,
    ok: i18n('labels.delDialogConfirm'),
    cancel: i18n('labels.delDialogCancel'),
  }).onOk(async () => {
    if (!projectData.value) {
      return;
    }
    const originData: Record<string, DataProjectType> = JSON.parse(
      JSON.stringify(toRaw(projectData.value)),
    );
    delete originData[project];
    await dataStoreService.setAppDataAsync('project', originData);
    await refreshHandle();
  });
};

onMounted(() => {
  refreshHandle();
});
</script>

<template>
  <q-card bordered flat>
    <q-card-section class="text-h5">
      {{ i18n('labels.title') }}
    </q-card-section>
    <q-list bordered separator v-if="projectData">
      <q-item v-for="project in projectList" :key="project">
        <q-item-section>
          <q-item-label>{{ projectData[project].id }}</q-item-label>
          <q-item-label caption>{{ project }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn flat @click="() => editProjectHandle(project)">
            {{ i18n('labels.btnEdit') }}
          </q-btn>
          <q-btn flat @click="() => delProjectHandle(project)">{{
            i18n('labels.btnDel')
          }}</q-btn>
        </q-item-section>
      </q-item>
    </q-list>
    <q-dialog v-model="editFlag" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">{{ editProject.project }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <ProjectIdInput
            v-model="editProject.id"
            @update:error="error = $event"
          />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat :label="i18n('labels.editDialogCancel')" v-close-popup />
          <q-btn
            flat
            :label="i18n('labels.editDialogConfirm')"
            v-if="!error"
            v-close-popup
            @click="() => confirmEdit()"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<style scoped></style>
