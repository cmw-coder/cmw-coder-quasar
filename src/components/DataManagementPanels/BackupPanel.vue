<script setup lang="ts">
import { Dialog, Notify, useQuasar } from 'quasar';
import { onMounted, onUnmounted, ref } from 'vue';

import CodeViewDialog from 'components/CodeViewDialog.vue';
import { ServiceType } from 'shared/types/service';
import { AppData } from 'shared/types/service/DataStoreServiceTrait/types';
import { getLastDirName, i18nSubPath, useService } from 'utils/common';

const baseName = 'components.DataManagementPanels.BackupPanel';

const { dark, dialog } = useQuasar();
const dataStoreService = useService(ServiceType.DATA_STORE);

const backups = ref<Omit<AppData['backup'], 'intervalMinutes'>>();
const loading = ref(false);
const refreshInterval = ref(0);
const refreshCounter = ref(0);

const i18n = i18nSubPath(baseName);

const previewBackup = async (backupPath: string) => {
  const buffer = await dataStoreService.retrieveBackup(backupPath);
  Dialog.create({
    component: CodeViewDialog,
    componentProps: {
      title: getLastDirName(backupPath),
      buffer,
    },
  });
};

const restoreBackup = async (type: 'current' | 'previous', index: number) => {
  const isConfirm = await new Promise((resolve) =>
    dialog({
      persistent: true,
      title: i18n('dialogs.restore.title'),
      message: i18n('dialogs.restore.message'),
      ok: i18n('dialogs.restore.confirm'),
      cancel: i18n('dialogs.restore.cancel'),
    })
      .onOk(() => resolve(true))
      .onCancel(() => resolve(false))
      .onDismiss(() => resolve(false)),
  );
  if (!isConfirm) {
    return;
  }

  try {
    switch (type) {
      case 'current': {
        await dataStoreService.restoreBackup(true, index);
        break;
      }
      case 'previous': {
        await dataStoreService.restoreBackup(false, index);
        break;
      }
    }
    Notify.create({
      type: 'positive',
      message: i18n('notifications.restoreSuccess'),
    });
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: i18n('notifications.restoreFailed'),
      caption: (<Error>error).message,
    });
  }
  await refreshBackupData();
};

const refreshBackupData = async () => {
  loading.value = true;
  const { backup } = await dataStoreService.getAppDataAsync();
  backups.value = {
    current: backup.current,
    previous: backup.previous,
  };
  refreshCounter.value = 0;
  setTimeout(
    () => {
      loading.value = false;
    },
    200 + Math.random() * 500,
  );
};

onMounted(() => {
  refreshBackupData();
  refreshInterval.value = <number>(<unknown>setInterval(() => {
    refreshCounter.value += 1;
    if (refreshCounter.value >= 600) {
      refreshCounter.value = 0;
      refreshBackupData();
    }
  }, 100));
});

onUnmounted(() => {
  clearInterval(refreshInterval.value);
});
</script>

<template>
  <div class="column q-gutter-y-md">
    <div class="row items-center q-gutter-x-md">
      <q-linear-progress
        class="col-grow"
        animation-speed="350"
        rounded
        size="xl"
        :value="refreshCounter / 600"
      />
      <q-btn
        color="primary"
        dense
        icon="mdi-refresh"
        :label="i18n('labels.refreshBackups')"
        :loading="loading"
        @click="refreshBackupData"
      />
    </div>
    <q-card v-for="(data, type) in backups" :key="type" bordered flat>
      <q-card-section>
        <div class="row items-center justify-between">
          <div class="text-h6 text-bold text-primary">
            {{ i18n(`labels.${type}`) }}
          </div>
          <div v-if="data" class="column items-end">
            <div>
              <q-chip dense>
                <q-avatar :color="dark.isActive ? 'grey-3' : 'grey-5'">
                  <q-icon name="mdi-identifier" size="0.8rem" />
                </q-avatar>
                {{ data.projectId }}
              </q-chip>
            </div>
            <div class="text-grey">
              {{ data.originalPath }}
            </div>
          </div>
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section v-if="!data">
        <div class="text-center text-h6 text-italic text-grey">
          {{ i18n('labels.noBackup') }}
        </div>
      </q-card-section>
      <div v-else>
        <q-list separator>
          <q-item
            v-for="(backupPathItem, backupPathIndex) in data.backupPathList"
            :key="backupPathIndex"
          >
            <q-item-section>
              <q-item-label>
                {{ getLastDirName(backupPathItem) }}
              </q-item-label>
              <q-item-label caption>
                <q-chip dense>
                  <q-avatar :color="dark.isActive ? 'grey-3' : 'grey-5'">
                    <q-icon name="mdi-calendar-clock" size="0.8rem" />
                  </q-avatar>
                  {{
                    new Date(
                      Number(getLastDirName(backupPathItem).split('-')[0]),
                    ).toLocaleString()
                  }}
                </q-chip>
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <div class="row q-gutter-x-sm">
                <q-btn
                  flat
                  dense
                  icon="mdi-eye"
                  @click="previewBackup(backupPathItem)"
                >
                  <q-tooltip>
                    {{ i18n('tooltips.preview') }}
                  </q-tooltip>
                </q-btn>
                <q-btn
                  color="primary"
                  dense
                  flat
                  icon="mdi-file-restore-outline"
                  @click="restoreBackup(type, backupPathIndex)"
                >
                  <q-tooltip>
                    {{ i18n('tooltips.restore') }}
                  </q-tooltip>
                </q-btn>
              </div>
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </q-card>
  </div>
</template>

<style scoped></style>
