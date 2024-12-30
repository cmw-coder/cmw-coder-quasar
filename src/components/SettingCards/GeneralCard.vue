<script setup lang="ts">
import { useQuasar } from 'quasar';
import allLanguages from 'quasar/lang/index.json';
import { onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { ServiceType } from 'shared/types/service';
import {
  DEFAULT_CONFIG_BASE,
  NUMBER_CONFIG_CONSTRAINTS,
} from 'shared/types/service/ConfigServiceTrait/constants';
import { WindowType } from 'shared/types/service/WindowServiceTrait/types';
import { EditorConfigServerMessage } from 'shared/types/WsMessage';

import ItemNumber, {
  Props as NumberProps,
} from 'components/ItemNumberInput.vue';
import ItemToggle, { Props as ToggleProps } from 'components/ItemToggle.vue';
import { messages } from 'src/i18n';
import { i18nSubPath, sleep, useService } from 'utils/common';

interface Locale {
  isoName: string;
  nativeName: string;
}

interface Theme {
  color: string;
  darkMode: boolean;
  icon: string;
  name: string;
}

const locales: Locale[] = allLanguages.filter((lang) =>
  Object.keys(messages).includes(lang.isoName),
);
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

const baseName = 'components.SettingCards.GeneralCard';

const appService = useService(ServiceType.App);
const configService = useService(ServiceType.CONFIG);
const dataStoreService = useService(ServiceType.DATA);
const websocketService = useService(ServiceType.WEBSOCKET);
const windowService = useService(ServiceType.WINDOW);

const { locale } = useI18n({ useScope: 'global' });
const { lang } = useQuasar();
const { push } = useRouter();

const i18n = i18nSubPath(baseName);

const updateNumberConfig = async (key: string, value: number) => {
  await configService.set(`generic.${key}`, value);
  websocketService.send(
    JSON.stringify(
      new EditorConfigServerMessage({
        result: 'success',
        generic: { [key]: value },
      }),
    ),
  );
};

const numberSettings: NumberProps[] = [
  {
    label: i18n('labels.backupInterval'),
    caption: i18n('labels.backupIntervalNotice'),
    suffix: i18n('labels.minutes'),
    defaultValue: defaultAppData.backup.intervalMinutes,
    resetTooltip: i18n('tooltips.resetToDefault'),
    initializer: async () => {
      const { backup } = await dataStoreService.getAppDataAsync();
      return backup.intervalMinutes;
    },
    updateHandler: async (
      oldValue: number,
      newValue: number,
    ): Promise<number> => {
      newValue = Math.round(newValue);
      if (newValue < APPDATA_NUMBER_CONSTANTS.backupInterval.min) {
        newValue = APPDATA_NUMBER_CONSTANTS.backupInterval.min;
      } else if (newValue > APPDATA_NUMBER_CONSTANTS.backupInterval.max) {
        newValue = APPDATA_NUMBER_CONSTANTS.backupInterval.max;
      } else if (isNaN(newValue)) {
        console.warn('Update backupInterval: Value is not a number', newValue);
        return oldValue;
      }

      const { backup } = await dataStoreService.getAppDataAsync();
      backup.intervalMinutes = newValue;
      await appService.updateBackupIntervalMinutes(newValue);
      await sleep(Math.floor(200 + Math.random() * 300));
      return newValue;
    },
  },
];

const toggleSettings: ToggleProps[] = [
  {
    label: i18n('labels.showSelectActionWindow'),
    caption: i18n('labels.showSelectActionWindowNotice'),
    initializer: async () => {
      const configs = await configService.getConfigs();
      return configs.showSelectedTipsWindow;
    },
    updateHandler: async (value: boolean) => {
      await configService.setConfig('showSelectedTipsWindow', value);
      await sleep(Math.floor(200 + Math.random() * 300));
      return true;
    },
  },
  {
    label: i18n('labels.showStatusWindow'),
    caption: i18n('labels.showStatusWindowNotice'),
    initializer: async () => {
      const configs = await configService.getConfigs();
      return configs.showStatusWindow;
    },
    updateHandler: async (value: boolean) => {
      await configService.setConfig('showStatusWindow', value);
      if (!value) {
        await windowService.hideWindow(WindowType.Status);
      }
      await sleep(Math.floor(200 + Math.random() * 300));
      return true;
    },
  },
  {
    label: i18n('labels.transparentFallback'),
    initializer: async () => {
      const { compatibility } = await dataStoreService.getAppDataAsync();
      return compatibility.transparentFallback;
    },
    updateHandler: async (value: boolean) => {
      const { compatibility } = await dataStoreService.getAppDataAsync();
      compatibility.transparentFallback = value;
      await dataStoreService.setAppDataAsync('compatibility', compatibility);
      await windowService.closeWindow(WindowType.Completions);
      await windowService.closeWindow(WindowType.Status);
      await windowService.closeWindow(WindowType.SelectionTips);
      setTimeout(() => {
        windowService.activeWindow(WindowType.Completions);
      }, 500);
      await sleep(Math.floor(200 + Math.random() * 300));
      return true;
    },
  },
  {
    label: i18n('labels.zoomFix'),
    initializer: async () => {
      const { compatibility } = await dataStoreService.getAppDataAsync();
      return compatibility.zoomFix;
    },
    updateHandler: async (value: boolean) => {
      const { compatibility } = await dataStoreService.getAppDataAsync();
      compatibility.zoomFix = value;
      await dataStoreService.setAppDataAsync('compatibility', compatibility);
      await sleep(Math.floor(200 + Math.random() * 300));
      return true;
    },
  },
];

const baseServerUrl = ref('');
const developerMode = ref(false);
const theme = ref(themes[0]);

const updateLocale = async (value: Locale) => {
  locale.value = value.isoName;
  await configService.setLocale(value.isoName);
};

const updateTheme = async (value: Theme) => {
  theme.value = value;
  await configService.setDarkMode(value.darkMode);
};

watch(
  () => baseServerUrl.value,
  async (url) => {
    await configService.setConfig('baseServerUrl', url);
  },
);

onMounted(async () => {
  developerMode.value =
    (await configService.getConfig('developerMode')) ?? false;
  const darkMode = await configService.getConfig('darkMode');
  locale.value =
    (await configService.getConfig('locale')) ?? lang.getLocale() ?? 'en-US';
  theme.value = themes.find((t) => t.darkMode === darkMode) ?? theme.value;
  baseServerUrl.value = (await configService.getConfig('baseServerUrl')) || '';
});
</script>

<template>
  <q-card bordered flat>
    <q-card-section class="text-h5">
      {{ i18n('labels.title') }}
    </q-card-section>
    <q-list bordered separator>
      <q-item tag="label">
        <q-item-section>
          {{ i18n('labels.baseServerUrl') }}
        </q-item-section>
        <q-item-section side>
          <div class="row items-center">
            <q-input
              dense
              input-class="text-right"
              v-model.trim="baseServerUrl"
            />
          </div>
        </q-item-section>
      </q-item>
      <q-expansion-item clickable group="generalSettingGroup">
        <template v-slot:header>
          <q-item-section>
            {{ i18n('labels.locale') }}
          </q-item-section>
          <q-item-section side>
            <q-item-label>
              {{
                locales.find(({ isoName }) => isoName == locale)?.nativeName ??
                locale
              }}
            </q-item-label>
          </q-item-section>
        </template>
        <q-list>
          <q-item
            v-for="(item, index) in locales"
            :key="index"
            clickable
            @click="updateLocale(item)"
          >
            <q-item-section class="q-pl-md">
              {{ item.nativeName }}
            </q-item-section>
            <q-item-section side>
              <q-item-label class="text-grey text-italic">
                {{ item.isoName }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-expansion-item>
      <q-expansion-item clickable group="generalSettingGroup">
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
            <q-item-section class="q-pl-md">
              {{ i18n(`labels.displayThemeOptions.${item.name}`) }}
            </q-item-section>
            <q-item-section side>
              <q-icon :name="item.icon" :color="item.color" />
            </q-item-section>
          </q-item>
        </q-list>
      </q-expansion-item>
      <item-toggle
        v-for="(toggleSetting, index) in toggleSettings"
        :key="index"
        :caption="toggleSetting.caption"
        :initializer="toggleSetting.initializer"
        :label="toggleSetting.label"
        :update-handler="toggleSetting.updateHandler"
      />
      <item-number
        v-for="(numberSetting, index) in numberSettings"
        :key="index"
        :label="numberSetting.label"
        :caption="numberSetting.caption"
        :suffix="numberSetting.suffix"
        :default-value="numberSetting.defaultValue"
        :reset-tooltip="numberSetting.resetTooltip"
        :initializer="numberSetting.initializer"
        :update-handler="numberSetting.updateHandler"
      />
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
