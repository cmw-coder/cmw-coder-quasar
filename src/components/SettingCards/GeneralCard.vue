<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { WindowType } from 'shared/types/WindowType';
import { useService } from 'utils/common';
import { ServiceType } from 'shared/types/service';

interface Theme {
  color: string;
  darkMode: boolean;
  icon: string;
  name: string;
}

const themes: Theme[] = [
  {
    color: 'yellow',
    darkMode: true,
    icon: 'dark_mode',
    name: 'dark',
  },
  {
    color: 'orange',
    darkMode: false,
    icon: 'light_mode',
    name: 'light',
  },
];

const baseName = 'components.SettingCards.GeneralCard.';

const theme = ref(themes[1]);
const developerMode = ref(false);

const dataStoreService = useService(ServiceType.DATA_STORE);
const windowService = useService(ServiceType.WINDOW);
const configService = useService(ServiceType.CONFIG);

const { t } = useI18n();
const { push } = useRouter();

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

const updateTransparentFallback = async (value: boolean) => {
  transparentFallbackUpdating.value = true;
  const { compatibility } = await dataStoreService.getAppDataAsync();
  compatibility.transparentFallback = value;
  await dataStoreService.setAppDataAsync('compatibility', compatibility);
  transparentFallback.value = value;
  await windowService.closeWindow(WindowType.Completions);
  setTimeout(() => windowService.activeWindow(WindowType.Completions), 500);
  transparentFallbackUpdating.value = false;
};

const updateZoomFix = async (value: boolean) => {
  zoomFixUpdating.value = true;
  const { compatibility } = await dataStoreService.getAppDataAsync();
  compatibility.zoomFix = value;
  await dataStoreService.setAppDataAsync('compatibility', compatibility);
  zoomFix.value = value;
  zoomFixUpdating.value = false;
};

const updateTheme = async (value: Theme) => {
  theme.value = value;
  configService.setDarkMode(value.darkMode);
};

onMounted(async () => {
  const { compatibility } = await dataStoreService.getAppDataAsync();
  developerMode.value = await configService.getConfig('developerMode');
  transparentFallback.value = compatibility.transparentFallback;
  zoomFix.value = compatibility.zoomFix;
  const darkMode = await configService.getConfig('darkMode');
  const _theme = themes.find((t) => t.darkMode === darkMode);
  if (_theme) {
    theme.value = _theme;
  }
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
