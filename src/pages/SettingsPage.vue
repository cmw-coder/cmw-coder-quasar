<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useQuasar } from 'quasar';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { UpdateCheckActionMessage } from 'shared/types/ActionMessage';
import { darkModes, Theme, useSettingsStore } from 'stores/settings';

const { t } = useI18n();
const { notify } = useQuasar();
const { push } = useRouter();
const { applyDarkMode } = useSettingsStore();
const { theme, developerMode } = storeToRefs(useSettingsStore());

const i18n = (relativePath: string, data?: Record<string, unknown>) => {
  if (data) {
    return t('pages.SettingsPage.' + relativePath, data);
  } else {
    return t('pages.SettingsPage.' + relativePath);
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

const goToDeveloperPage = () => {
  push('developer');
};

const selectTheme = (value: Theme) => {
  theme.value = value;
  applyDarkMode();
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
    goToDeveloperPage();
  }
};
</script>

<template>
  <q-page class="row justify-evenly q-pa-xl">
    <div class="column col-grow q-gutter-y-md">
      <q-card bordered flat>
        <q-card-section class="text-h5">
          {{ i18n('settings.general.label') }}
        </q-card-section>
        <q-list bordered separator>
          <q-expansion-item clickable>
            <template v-slot:header>
              <q-item-section>
                {{ i18n('settings.general.displayTheme.label') }}
              </q-item-section>
              <q-item-section side>
                <div class="row items-center q-gutter-x-sm">
                  <q-icon :color="theme.color" :name="theme.icon" size="sm" />
                  <div>
                    {{ i18n(`settings.general.displayTheme.${theme.name}`) }}
                  </div>
                </div>
              </q-item-section>
            </template>
            <q-list>
              <q-item
                v-for="(mode, key) in darkModes"
                :key="key"
                clickable
                @click="selectTheme(mode)"
              >
                <q-item-section>
                  {{ i18n(`settings.general.displayTheme.${mode.name}`) }}
                </q-item-section>
                <q-item-section side>
                  <q-icon :name="mode.icon" :color="mode.color" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-expansion-item>
          <q-item v-show="developerMode" clickable @click="goToDeveloperPage">
            <q-item-section>
              {{ i18n('settings.general.developerOptions') }}
            </q-item-section>
            <q-item-section side>
              <q-icon name="mdi-chevron-right" />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card>
      <q-card bordered flat>
        <q-card-section class="text-h5">
          {{ i18n('settings.update.label') }}
        </q-card-section>
        <q-list bordered separator>
          <q-item
            :class="checkForUpdateLoading ? 'text-grey' : ''"
            :clickable="!checkForUpdateLoading"
            @click="checkForUpdate"
          >
            <q-item-section>
              {{ i18n('settings.update.checkForUpdate.label') }}
            </q-item-section>
            <q-item-section side>
              <q-icon v-show="!checkForUpdateLoading" name="mdi-update" />
              <q-spinner v-show="checkForUpdateLoading" />
            </q-item-section>
          </q-item>
          <q-item clickable @click="tryEnableDeveloperMode">
            <q-item-section>
              {{ i18n('settings.update.appVersion.label') }}
            </q-item-section>
            <q-item-section side>{{ version }}</q-item-section>
          </q-item>
        </q-list>
      </q-card>
    </div>
  </q-page>
</template>

<style scoped></style>
