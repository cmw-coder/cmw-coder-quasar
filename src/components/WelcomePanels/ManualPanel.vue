<script setup lang="ts">
import { QStepper, useQuasar } from 'quasar';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { defaultServerUrlMap, NetworkZone } from 'shared/config';
import { checkUrlAccessible } from 'utils/common';

const baseName = 'components.WelcomePanels.ManualPanel.';

const { t } = useI18n();
const { notify } = useQuasar();

const i18n = (relativePath: string) => {
  return t(baseName + relativePath);
};

const emit = defineEmits<{
  go: [offset: number];
  finish: [
    data: {
      url: string;
      zone: NetworkZone;
    },
  ];
}>();

const options = [
  { label: i18n('labels.normalArea'), value: NetworkZone.Normal },
  { label: i18n('labels.secureArea'), value: NetworkZone.Secure },
  { label: i18n('labels.publicArea'), value: NetworkZone.Public },
];

const networkZone = ref(NetworkZone.Normal);
const pingLoading = ref(false);
const serverUrl = ref('');
const step = ref(0);
const stepper = ref<QStepper>();

const nextHandle = async () => {
  switch (step.value) {
    case 0: {
      serverUrl.value = defaultServerUrlMap[networkZone.value];
      stepper.value?.next();
      break;
    }
    case 1: {
      const pingUrl = `${serverUrl.value}/h3c-ai-assistant/`;
      pingLoading.value = true;
      if (await checkUrlAccessible(pingUrl)) {
        notify({
          type: 'positive',
          message: i18n('notifications.pingSuccess'),
        });
        emit('finish', { zone: networkZone.value, url: serverUrl.value });
      } else {
        notify({
          type: 'negative',
          message: i18n('notifications.pingError'),
        });
      }
      pingLoading.value = false;
      break;
    }
    default: {
      break;
    }
  }
};

const previousHandle = () => {
  switch (step.value) {
    case 0: {
      emit('go', -1);
      break;
    }
    case 1: {
      stepper.value?.previous();
      break;
    }
    default: {
      break;
    }
  }
};
</script>

<template>
  <div class="column q-gutter-y-md">
    <q-banner class="bg-orange" inline-actions rounded>
      {{ i18n('labels.title') }}
      <template v-slot:action>
        <q-btn dense icon="refresh" outline round @click="emit('go', -1)" />
      </template>
    </q-banner>
    <q-stepper
      ref="stepper"
      active-color="primary"
      animated
      done-color="positive"
      v-model="step"
    >
      <q-step
        :name="0"
        :title="i18n(`steps.${0}.title`)"
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
        :name="1"
        :title="i18n(`steps.${1}.title`)"
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
            :label="i18n(`steps.${step}.next`)"
          />
          <q-btn
            flat
            color="primary"
            @click="previousHandle"
            :label="i18n(`steps.${step}.previous`)"
            class="q-ml-sm"
          />
        </q-stepper-navigation>
      </template>
    </q-stepper>
  </div>
</template>

<style scoped></style>
