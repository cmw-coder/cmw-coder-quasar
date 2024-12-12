<script setup lang="ts">
import { extend, useQuasar } from 'quasar';
import { computed, onMounted, reactive, ref, toRaw } from 'vue';

import { i18nSubPath, useService } from 'utils/common';
import { ServiceType } from 'shared/types/service';
import { DataProjectType } from 'shared/types/service/DataStoreServiceTrait/types';

const baseName = 'components.DataManagementPanels.ProjectIdPanel';

const dataStoreService = useService(ServiceType.DATA_STORE);
const { dialog } = useQuasar();

const loading = ref(false);
const projectData = ref<undefined | Record<string, DataProjectType>>();
const projectList = computed(() => {
  return Object.keys(projectData.value || {});
});

const editFlag = ref(false);
const editProject = reactive({
  project: '',
  id: '',
  isAutoManaged: true,
  svn: [] as {
    directory: string;
    revision: number;
  }[],
});

const i18n = i18nSubPath(baseName);

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
  const projectItem = extend(
    true,
    {},
    toRaw(projectData.value[project]),
  ) as DataProjectType;
  console.log('editProjectHandle', projectItem);
  editProject.id = projectItem.id;
  editProject.project = project;
  editProject.svn = projectItem.svn;
  editProject.isAutoManaged = projectItem.isAutoManaged;
};

const confirmEdit = async () => {
  if (!projectData.value) {
    return;
  }
  const originData: Record<string, DataProjectType> = JSON.parse(
    JSON.stringify(toRaw(projectData.value)),
  );
  originData[editProject.project].id = editProject.id;
  originData[editProject.project].svn = toRaw(editProject.svn);
  originData[editProject.project].isAutoManaged = editProject.isAutoManaged;
  await dataStoreService.setAppDataAsync('project', originData);
  await refreshHandle();
  editFlag.value = false;
};

const delProjectHandle = (project: string) => {
  if (!projectData.value) {
    return;
  }
  dialog({
    title: i18n('dialogs.delete.title'),
    message: i18n('dialogs.delete.message'),
    persistent: true,
    ok: i18n('dialogs.delete.confirm'),
    cancel: i18n('dialogs.delete.cancel'),
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

const addSvnDirHandle = async () => {
  const svnService = useService(ServiceType.SVN);
  const data = await svnService.selectSvnDirectory();
  if (!data) {
    return;
  }
  const exist = editProject.svn.find(
    (item) => item.directory === data.directory,
  );
  if (exist) {
    return;
  }
  editProject.svn.push(data);
};

onMounted(() => {
  refreshHandle();
});
</script>

<template>
  <q-card v-if="projectData" bordered flat>
    <q-card-section v-if="!projectList.length">
      <div class="text-center text-h6 text-italic text-grey">
        {{ i18n('labels.noProject') }}
      </div>
    </q-card-section>
    <q-list v-else separator>
      <q-item v-for="project in projectList" :key="project">
        <q-item-section>
          <q-item-label>
            {{ projectData[project].id }}
            <q-chip dense>
              {{
                projectData[project].isAutoManaged
                  ? i18n('labels.auto')
                  : i18n('labels.manual')
              }}
            </q-chip>
          </q-item-label>
          <q-item-label caption>{{ project }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn flat @click="() => editProjectHandle(project)">
            {{ i18n('labels.btnEdit') }}
          </q-btn>
          <q-btn color="negative" flat @click="() => delProjectHandle(project)"
            >{{ i18n('labels.btnDel') }}
          </q-btn>
        </q-item-section>
      </q-item>
    </q-list>
    <q-dialog v-model="editFlag" persistent>
      <q-card style="min-width: 350px">
        <q-form>
          <q-card-section>
            <div class="text-h6">{{ editProject.project }}</div>
          </q-card-section>
          <q-card-section>
            <q-input
              filled
              :label="i18n('labels.idInputLabel')"
              :hint="i18n('labels.idInputHint')"
              :maxlength="14"
              outlined
              v-model.trim="editProject.id"
              :rules="[
                (val) =>
                  /^NV[0-9]{12}$/.test(val) ||
                  /^TB[0-9]{12}$/.test(val) ||
                  /^Temp_[0-9]{8}_[0-9]{6}$/.test(val) ||
                  i18n('labels.idInputError'),
              ]"
            >
            </q-input>
          </q-card-section>
          <q-card-section>
            <q-toggle
              v-model="editProject.isAutoManaged"
              :label="i18n('labels.autoManagedInputLabel')"
            />
          </q-card-section>
          <q-card-section v-if="!editProject.isAutoManaged">
            <div style="display: flex; align-items: center">
              <div class="text-h7">{{ i18n('labels.svnManagedLabel') }}</div>
              <q-btn
                :label="i18n('labels.addSvnDir')"
                icon="add"
                flat
                color="primary"
                @click="() => addSvnDirHandle()"
              ></q-btn>
            </div>
            <q-list bordered separator>
              <q-item v-for="svn in editProject.svn" :key="svn.directory">
                <q-item-section>
                  <q-item-label>{{ svn.directory }}</q-item-label>
                </q-item-section>
                <q-item-section avatar>
                  <q-btn
                    :label="i18n('labels.delSvnDir')"
                    flat
                    color="red"
                    @click="
                      () => {
                        editProject.svn.splice(editProject.svn.indexOf(svn), 1);
                      }
                    "
                  ></q-btn>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
          <q-card-section
            style="
              display: flex;
              align-items: center;
              justify-content: flex-end;
            "
          >
            <q-btn
              flat
              :label="i18n('labels.editDialogCancel')"
              v-close-popup
              style="margin-right: 10px"
            />
            <q-btn
              :label="i18n('labels.editDialogConfirm')"
              color="primary"
              @click="() => confirmEdit()"
            />
          </q-card-section>
        </q-form>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<style scoped></style>
