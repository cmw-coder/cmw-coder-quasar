<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { darkModes, Theme, useSettingsStore } from 'stores/settings';

const { theme, developerMode } = storeToRefs(useSettingsStore());
const { t } = useI18n();
const { push } = useRouter();
const { applyDarkMode } = useSettingsStore();

const i18n = (relativePath: string, data?: Record<string, unknown>) => {
  if (data) {
    return t('components.SettingCards.GeneralCard.' + relativePath, data);
  } else {
    return t('components.SettingCards.GeneralCard.' + relativePath);
  }
};

const selectTheme = (value: Theme) => {
  theme.value = value;
  applyDarkMode();
};
</script>

<template>
  <q-card bordered flat>
    <q-card-section class="text-h5">
      {{ i18n('labels.title') }}
    </q-card-section>
    <q-list bordered separator>
      <q-expansion-item clickable>
        <template v-slot:header>
          <q-item-section>
            {{ i18n('labels.displayTheme') }}
          </q-item-section>
          <q-item-section side>
            <div class="row items-center q-gutter-x-sm">
              <q-icon :color="theme.color" :name="theme.icon" size="sm" />
              <div>
                {{ i18n(`labels.displayThemeOptions.${theme.name}`) }}
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
              {{ i18n(`labels.displayThemeOptions.${theme.name}`) }}
            </q-item-section>
            <q-item-section side>
              <q-icon :name="mode.icon" :color="mode.color" />
            </q-item-section>
          </q-item>
        </q-list>
      </q-expansion-item>
      <q-item v-show="developerMode" clickable @click="push('developer')">
        <q-item-section>
          {{ i18n('labels.developerOptions') }}
        </q-item-section>
        <q-item-section side>
          <q-icon name="mdi-chevron-right" />
        </q-item-section>
      </q-item>
    </q-list>
  </q-card>
</template>

<style scoped></style>
