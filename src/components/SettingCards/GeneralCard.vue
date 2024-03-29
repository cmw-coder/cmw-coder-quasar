<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { WindowType } from 'shared/types/WindowType';
import {
  ActionType,
  DataStoreLoadActionMessage,
  DataStoreSaveActionMessage,
} from 'shared/types/ActionMessage';
import { themes, Theme, useSettingsStore } from 'stores/settings';
import { ActionApi } from 'types/ActionApi';

const baseName = 'components.SettingCards.GeneralCard.';

const { theme, developerMode } = storeToRefs(useSettingsStore());
const { t } = useI18n();
const { push } = useRouter();
const { applyDarkMode } = useSettingsStore();

const i18n = (relativePath: string, data?: Record<string, unknown>) => {
  if (data) {
    return t(baseName + relativePath, data);
  } else {
    return t(baseName + relativePath);
  }
};

const transparentFallback = ref<boolean>();
const transparentFallbackUpdating = ref(false);
const zoomFix = ref<boolean>();
const zoomFixUpdating = ref(false);

const updateTransparentFallback = (value: boolean) => {
  transparentFallbackUpdating.value = true;
  window.actionApi.send(
    new DataStoreSaveActionMessage({
      compatibility: {
        transparentFallback: value,
      },
    }),
  );
  window.actionApi.send(new DataStoreLoadActionMessage());
  window.controlApi.close(WindowType.Immersive);
};

const updateZoomFix = (value: boolean) => {
  zoomFixUpdating.value = true;
  window.actionApi.send(
    new DataStoreSaveActionMessage({
      compatibility: {
        zoomFix: value,
      },
    }),
  );
  window.actionApi.send(new DataStoreLoadActionMessage());
};

const updateTheme = (value: Theme) => {
  theme.value = value;
  applyDarkMode();
  window.controlApi.reload(WindowType.Floating);
  window.controlApi.reload(WindowType.Immersive);
};

const actionApi = new ActionApi(baseName);
onMounted(() => {
  actionApi.register(ActionType.DataStoreLoad, (data) => {
    if (data) {
      transparentFallback.value = data.compatibility.transparentFallback;
      transparentFallbackUpdating.value = false;
      zoomFix.value = data.compatibility.zoomFix;
      zoomFixUpdating.value = false;
    }
  });
  window.actionApi.send(new DataStoreLoadActionMessage());
});
onBeforeUnmount(() => {
  actionApi.unregister();
});
</script>

<template>
  <q-card bordered flat>
    <q-card-section class="text-h5">
      {{ i18n('labels.title') }}
    </q-card-section>
    <q-list bordered separator>
      <q-expansion-item clickable group="settingGroup">
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
            v-for="(item, index) in themes"
            :key="index"
            clickable
            @click="updateTheme(item)"
          >
            <q-item-section>
              {{ i18n(`labels.displayThemeOptions.${item.name}`) }}
            </q-item-section>
            <q-item-section side>
              <q-icon :name="item.icon" :color="item.color" />
            </q-item-section>
          </q-item>
        </q-list>
      </q-expansion-item>
      <q-item :disable="transparentFallbackUpdating" tag="label">
        <q-item-section>
          {{ i18n('labels.transparentFallback') }}
        </q-item-section>
        <q-item-section side>
          <div class="row items-center">
            <q-spinner v-show="transparentFallbackUpdating" size="sm" />
            <q-toggle
              :disable="transparentFallbackUpdating"
              :model-value="transparentFallback"
              @update:model-value="updateTransparentFallback($event)"
            />
          </div>
        </q-item-section>
      </q-item>
      <q-item :disable="zoomFixUpdating" tag="label">
        <q-item-section>
          {{ i18n('labels.zoomFix') }}
        </q-item-section>
        <q-item-section side>
          <div class="row items-center">
            <q-spinner v-show="zoomFixUpdating" size="sm" />
            <q-toggle
              :disable="zoomFixUpdating"
              :model-value="zoomFix"
              @update:model-value="updateZoomFix($event)"
            />
          </div>
        </q-item-section>
      </q-item>
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
