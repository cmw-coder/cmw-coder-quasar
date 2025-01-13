<script lang="ts" setup>
import { useQuasar } from 'quasar';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { ServiceType } from 'shared/types/service';
import { DEFAULT_CONFIG_MAP } from 'shared/types/service/ConfigServiceTrait/constants';
import { NetworkZone } from 'shared/types/service/ConfigServiceTrait/types';

import AutoPanel from 'components/WelcomePanels/AutoPanel.vue';
import FinishPanel from 'components/WelcomePanels/FinishPanel.vue';
import ManualPanel from 'components/WelcomePanels/ManualPanel.vue';
import { useService } from 'utils/common';

const baseName = 'pages.WelcomePage.';

const { t } = useI18n();
const { notify } = useQuasar();
const configService = useService(ServiceType.CONFIG);
const windowService = useService(ServiceType.WINDOW);
const updaterService = useService(ServiceType.UPDATER);

const i18n = (relativePath: string) => {
  return t(baseName + relativePath);
};

const panelIndex = ref(0);

const finishHandle = async (data: { url: string; zone: NetworkZone }) => {
  try {
    await updateConfig(data.url, data.zone);
    panelIndex.value = 2;
  } catch (e) {
    notify({
      type: 'negative',
      message: i18n('notifications.configError'),
      caption: (<Error>e).message,
    });
    panelIndex.value = 1;
  }
};

const updateConfig = async (url: string, networkZone: NetworkZone) => {
  const username = await configService.get('username');
  await configService.setConfigs({
    ...DEFAULT_CONFIG_MAP[networkZone],
    baseServerUrl: url,
    username,
  });
  await updaterService.init();
};
</script>

<template>
  <q-page class="flex-center row q-pa-md">
    <div class="col-10 column q-gutter-y-xl">
      <div class="text-bold text-center text-h3">
        {{ i18n('labels.title') }}
      </div>
      <q-card>
        <q-tab-panels class="bg-transparent" animated v-model="panelIndex">
          <q-tab-panel :name="0">
            <auto-panel
              @finish="(data) => finishHandle(data)"
              @go="(offset) => (panelIndex += offset)"
            />
          </q-tab-panel>
          <q-tab-panel :name="1">
            <manual-panel
              @finish="(data) => finishHandle(data)"
              @go="(offset) => (panelIndex += offset)"
            />
          </q-tab-panel>
          <q-tab-panel :name="2">
            <finish-panel @finish="windowService.finishWelcome()" />
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </div>
  </q-page>
</template>

<style lang="scss" scoped></style>
