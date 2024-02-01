<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useQuasar } from 'quasar';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { useSettingsStore } from 'stores/settings';
import { UpdateCheckActionMessage } from 'shared/types/ActionMessage';

const { developerMode } = storeToRefs(useSettingsStore());
const { t } = useI18n();
const { notify } = useQuasar();
const { push } = useRouter();

const i18n = (relativePath: string, data?: Record<string, unknown>) => {
  if (data) {
    return t('components.SettingCards.UpdateCard.' + relativePath, data);
  } else {
    return t('components.SettingCards.UpdateCard.' + relativePath);
  }
};

const checkForUpdateLoading = ref(false);
const developerModeCounter = ref(0);
const version = ref('1.0.1');

const checkForUpdate = () => {
  checkForUpdateLoading.value = true;
  window.actionApi.send(new UpdateCheckActionMessage());
  setTimeout(() => {
    checkForUpdateLoading.value = false;
  }, 1500);
};

const tryEnableDeveloperMode = () => {
  developerModeCounter.value++;
  if (developerModeCounter.value >= 3 && developerModeCounter.value < 7) {
    notify({
      type: 'info',
      group: 'developerMode',
      message: i18n('notifications.developerModeOngoing', {
        times: 7 - developerModeCounter.value,
      }),
      icon: 'mdi-dev-to',
    });
  } else if (developerModeCounter.value >= 7) {
    developerModeCounter.value = 0;
    developerMode.value = true;
    notify({
      type: 'positive',
      message: i18n('notifications.developerModeEnabled'),
      icon: 'mdi-dev-to',
    });
    push('developer');
  }
};
</script>

<template>
  <q-card bordered flat>
    <q-card-section class="text-h5">
      {{ i18n('labels.title') }}
    </q-card-section>
    <q-list bordered separator>
      <q-item
        :class="checkForUpdateLoading ? 'text-grey' : ''"
        :clickable="!checkForUpdateLoading"
        @click="checkForUpdate"
      >
        <q-item-section>
          {{ i18n('labels.checkForUpdate') }}
        </q-item-section>
        <q-item-section side>
          <q-icon v-show="!checkForUpdateLoading" name="mdi-update" />
          <q-spinner v-show="checkForUpdateLoading" />
        </q-item-section>
      </q-item>
      <q-item clickable @click="tryEnableDeveloperMode">
        <q-item-section>
          {{ i18n('labels.appVersion') }}
        </q-item-section>
        <q-item-section side>{{ version }}</q-item-section>
      </q-item>
    </q-list>
  </q-card>
</template>

<style scoped></style>
