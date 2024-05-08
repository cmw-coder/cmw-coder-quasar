<script lang="ts" setup>
import { Ref, ref } from 'vue';
import { QStepper, useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import {
  NetworkZone,
  defaultAppConfigNetworkZoneMap,
  defaultServerUrlMap,
} from 'shared/config';
import { checkUrlAccessible, useService } from 'utils/common';
import { ServiceType } from 'shared/services';

const baseName = 'pages.StartSettingPage.';

const { t } = useI18n();

const { notify } = useQuasar();

const i18n = (relativePath: string) => {
  return t(baseName + relativePath);
};

const step = ref(1);
const stepper = ref(null as unknown as InstanceType<typeof QStepper>);

const networkZone: Ref<NetworkZone> = ref(NetworkZone.Normal);
const serverUrl = ref('');
const configService = useService(ServiceType.CONFIG);
const windowService = useService(ServiceType.WINDOW);

const pingLoading = ref(false);

const nextHandle = async () => {
  if (step.value === 1) {
    serverUrl.value = defaultServerUrlMap[networkZone.value];
    stepper.value.next();
  } else {
    // 测试地址是否可以访问通过
    const pingUrl = `${serverUrl.value}/h3c-ai-assistant/`;
    try {
      pingLoading.value = true;
      await checkUrlAccessible(pingUrl);
      notify({
        type: 'positive',
        message: i18n('notifications.pingSuccess'),
      });
      // 保存配置
      const originalAppConfig = await configService.getConfigs();
      const defaultNetworkZoneAppConfig =
        defaultAppConfigNetworkZoneMap[networkZone.value];
      originalAppConfig.networkZone = networkZone.value;
      originalAppConfig.baseServerUrl = serverUrl.value;

      // 从默认配置中获取
      originalAppConfig.activeTemplate =
        defaultNetworkZoneAppConfig.activeTemplate;
      originalAppConfig.activeModel = defaultNetworkZoneAppConfig.activeModel;
      originalAppConfig.activeModelKey =
        defaultNetworkZoneAppConfig.activeModelKey;
      originalAppConfig.activeChat = defaultNetworkZoneAppConfig.activeChat;
      originalAppConfig.completionConfigs =
        defaultNetworkZoneAppConfig.completionConfigs;

      // 保存配置
      await configService.setConfigs(originalAppConfig);
      await windowService.finishStartSetting();
    } catch (e) {
      notify({
        type: 'negative',
        message: i18n('notifications.pingError'),
      });
    } finally {
      pingLoading.value = false;
    }
  }
};
</script>

<template>
  <q-page class="row flex-center q-pa-lg">
    <div class="col-10 column">
      <div class="q-gutter-y-lg">
        <div class="text-bold text-center text-h2">
          {{ i18n('labels.title') }}
        </div>
      </div>
      <q-stepper v-model="step" ref="stepper" color="primary" animated>
        <q-step
          :name="1"
          :title="i18n('labels.stepOneTitle')"
          icon="settings"
          :done="step > 0"
        >
          <div class="q-gutter-sm">
            <q-radio
              v-model="networkZone"
              checked-icon="task_alt"
              unchecked-icon="panorama_fish_eye"
              :val="NetworkZone.Normal"
              :label="i18n('labels.redArea')"
            />
            <q-radio
              v-model="networkZone"
              checked-icon="task_alt"
              unchecked-icon="panorama_fish_eye"
              :val="NetworkZone.Secure"
              :label="i18n('labels.redRouteArea')"
            />
            <q-radio
              v-model="networkZone"
              checked-icon="task_alt"
              unchecked-icon="panorama_fish_eye"
              :val="NetworkZone.Public"
              :label="i18n('labels.normalArea')"
            />
          </div>
        </q-step>

        <q-step
          :name="2"
          :title="i18n('labels.stepTwoTitle')"
          icon="settings"
          :done="step > 1"
        >
          <q-input v-model="serverUrl" label="Server url" />
        </q-step>

        <template v-slot:navigation>
          <q-stepper-navigation>
            <q-btn
              @click="() => nextHandle()"
              color="primary"
              :loading="pingLoading"
              :label="
                step === 2 ? i18n('labels.finish') : i18n('labels.continue')
              "
            />
            <q-btn
              v-if="step > 1"
              flat
              color="primary"
              @click="stepper.previous()"
              :label="i18n('labels.back')"
              class="q-ml-sm"
            />
          </q-stepper-navigation>
        </template>
      </q-stepper>
    </div>
  </q-page>
</template>

<style lang="scss" scoped></style>
