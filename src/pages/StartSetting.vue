<script lang="ts" setup>
import { onMounted, Ref, ref } from 'vue';
import { QStepper, useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import {
  NetworkZone,
  defaultAppConfigNetworkZoneMap,
  defaultServerUrlMap,
} from 'shared/config';
import { checkUrlAccessible, useService } from 'utils/common';
import { ServiceType } from 'shared/types/service';

const baseName = 'pages.StartSettingPage.';

const { t } = useI18n();

const { notify } = useQuasar();

const i18n = (relativePath: string) => {
  return t(baseName + relativePath);
};

const options = [
  { label: i18n('labels.redArea'), value: NetworkZone.Normal },
  { label: i18n('labels.redRouteArea'), value: NetworkZone.Secure },
  { label: i18n('labels.normalArea'), value: NetworkZone.Public },
];

const step = ref(1);
const stepper = ref(null as unknown as InstanceType<typeof QStepper>);

const networkZone: Ref<NetworkZone> = ref(NetworkZone.Normal);
const serverUrl = ref('');
const configService = useService(ServiceType.CONFIG);
const windowService = useService(ServiceType.WINDOW);
const updaterService = useService(ServiceType.UPDATER);

const detectLoading = ref(false);
const pingLoading = ref(false);

const nextHandle = async () => {
  if (step.value === 1) {
    serverUrl.value = defaultServerUrlMap[networkZone.value];
    stepper.value.next();
  } else {
    // 测试地址是否可以访问通过
    const pingUrl = `${serverUrl.value}/h3c-ai-assistant/`;
    pingLoading.value = true;
    if (await checkUrlAccessible(pingUrl)) {
      notify({
        type: 'positive',
        message: i18n('notifications.pingSuccess'),
      });
      try {
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
        await updaterService.init();
      } catch (e) {
        notify({
          type: 'negative',
          message: i18n('notifications.configError'),
          caption: (<Error>e).message,
        });
      }
    } else {
      notify({
        type: 'negative',
        message: i18n('notifications.pingError'),
      });
    }
    pingLoading.value = false;
  }
};

onMounted(async () => {
  detectLoading.value = true;
  const results = new Map<NetworkZone, boolean>(
    <[NetworkZone, boolean][]>(
      await Promise.all(
        [NetworkZone.Normal, NetworkZone.Secure, NetworkZone.Public].map(
          async (zone: NetworkZone) => [
            zone,
            await checkUrlAccessible(
              `${defaultServerUrlMap[zone]}/h3c-ai-assistant/`,
            ),
          ],
        ),
      )
    ),
  );
  for (const [zone, result] of results) {
    if (result) {
      networkZone.value = zone;
      stepper.value.next();
      break;
    }
  }
  detectLoading.value = false;
});
</script>

<template>
  <q-page class="row flex-center q-pa-lg">
    <div class="col-10 column">
      <div class="q-gutter-y-lg">
        <div class="text-bold text-center text-h2">
          {{ i18n('labels.title') }}
        </div>
      </div>
      <q-stepper
        ref="stepper"
        active-color="primary"
        animated
        done-color="positive"
        v-model="step"
      >
        <q-step
          :name="1"
          :title="i18n('labels.stepOneTitle')"
          icon="settings"
          :done="step > 0"
        >
          <q-option-group
            color="primary"
            :options="options"
            v-model="networkZone"
          />
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
              @click="nextHandle"
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
