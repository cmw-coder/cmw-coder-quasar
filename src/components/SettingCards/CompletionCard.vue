<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { ServiceType } from 'shared/types/service';
import {
  DEFAULT_CONFIG_BASE,
  NUMBER_CONFIG_CONSTRAINTS,
} from 'shared/types/service/ConfigServiceTrait/constants';
import { EditorConfigServerMessage } from 'shared/types/WsMessage';

import ItemNumber, {
  Props as NumberProps,
} from 'components/ItemNumberInput.vue';
import {
  api_getProductLineQuestionTemplateFile,
  api_getUserTemplateList,
} from 'src/request/api';
import { i18nSubPath, sleep, useService } from 'utils/common';


const baseName = 'components.SettingCards.CompletionCard';

const configService = useService(ServiceType.CONFIG);
const dataStoreService = useService(ServiceType.DATA);
const websocketService = useService(ServiceType.WEBSOCKET);

const productLineList = ref<string[]>([]);
const modelList = ref<
  {
    label: string;
    value: string;
    modelKey: string;
  }[]
>([]);
const productLineLoading = ref(false);
const selectedProductLine = ref('');
const modelLoading = ref(false);
const selectedModel = ref<{
  label: string;
  value: string;
  modelKey: string;
}>();

const i18n = i18nSubPath(baseName);

const updateNumberConfig = async (key: string, value: number) => {
  await configService.set(`completion.${key}`, value);
  websocketService.send(
    JSON.stringify(
      new EditorConfigServerMessage({
        result: 'success',
        completion: { [key]: value },
      }),
    ),
  );
};

const numberProps: NumberProps[] = [
  {
    title: i18n('numberProps.debounceDelay.title'),
    caption: i18n('numberProps.debounceDelay.caption'),
    suffix: i18n('suffixes.milliseconds'),
    defaultValue: DEFAULT_CONFIG_BASE.completion.debounceDelayMilliSeconds,
    minValue:
      NUMBER_CONFIG_CONSTRAINTS.completion.debounceDelayMilliSeconds.min,
    maxValue:
      NUMBER_CONFIG_CONSTRAINTS.completion.debounceDelayMilliSeconds.max,
    lowThreshold: {
      value: NUMBER_CONFIG_CONSTRAINTS.completion.debounceDelayMilliSeconds.low,
      hint: i18n('numberProps.debounceDelay.tooLow'),
    },
    highThreshold: {
      value:
        NUMBER_CONFIG_CONSTRAINTS.completion.debounceDelayMilliSeconds.high,
      hint: i18n('numberProps.debounceDelay.tooHigh'),
    },
    initializer: async () =>
      (await configService.get('completion')).debounceDelayMilliSeconds,
    updateHandler: async (oldValue, newValue) => {
      try {
        newValue = Math.round(newValue);
        await updateNumberConfig('debounceDelayMilliSeconds', newValue);
        await sleep(Math.floor(200 + Math.random() * 300));
        return newValue;
      } catch (e) {
        console.error(e);
        return oldValue;
      }
    },
  },
  {
    title: i18n('numberProps.pasteFixMaxTriggerLineCount.title'),
    caption: i18n('numberProps.pasteFixMaxTriggerLineCount.caption'),
    defaultValue: DEFAULT_CONFIG_BASE.completion.pasteFixMaxTriggerLineCount,
    minValue: NUMBER_CONFIG_CONSTRAINTS.completion.pasteFixMaxTriggerLineCount.min,
    maxValue: NUMBER_CONFIG_CONSTRAINTS.completion.pasteFixMaxTriggerLineCount.max,
    highThreshold: {
      value: NUMBER_CONFIG_CONSTRAINTS.completion.pasteFixMaxTriggerLineCount.high,
      hint: i18n('numberProps.pasteFixMaxTriggerLineCount.tooHigh'),
    },
    initializer: async () =>
      (await configService.get('completion')).pasteFixMaxTriggerLineCount,
    updateHandler: async (oldValue, newValue) => {
      try {
        newValue = Math.round(newValue);
        await updateNumberConfig('pasteFixMaxTriggerLineCount', newValue);
        await sleep(Math.floor(200 + Math.random() * 300));
        return newValue;
      } catch (e) {
        console.error(e);
        return oldValue;
      }
    },
  },
  {
    title: i18n('numberProps.recentFileCount.title'),
    caption: i18n('numberProps.recentFileCount.caption'),
    defaultValue: DEFAULT_CONFIG_BASE.completion.recentFileCount,
    minValue: NUMBER_CONFIG_CONSTRAINTS.completion.recentFileCount.min,
    maxValue: NUMBER_CONFIG_CONSTRAINTS.completion.recentFileCount.max,
    highThreshold: {
      value: NUMBER_CONFIG_CONSTRAINTS.completion.recentFileCount.high,
      hint: i18n('numberProps.recentFileCount.tooHigh'),
    },
    initializer: async () =>
      (await configService.get('completion')).recentFileCount,
    updateHandler: async (oldValue, newValue) => {
      try {
        newValue = Math.round(newValue);
        await updateNumberConfig('recentFileCount', newValue);
        await sleep(Math.floor(200 + Math.random() * 300));
        return newValue;
      } catch (e) {
        console.error(e);
        return oldValue;
      }
    }
  },
  {
    title: i18n('numberProps.prefixLineCount.title'),
    caption: i18n('numberProps.prefixLineCount.caption'),
    defaultValue: DEFAULT_CONFIG_BASE.completion.prefixLineCount,
    minValue: NUMBER_CONFIG_CONSTRAINTS.completion.prefixLineCount.min,
    maxValue: NUMBER_CONFIG_CONSTRAINTS.completion.prefixLineCount.max,
    highThreshold: {
      value: NUMBER_CONFIG_CONSTRAINTS.completion.prefixLineCount.high,
      hint: i18n('numberProps.prefixLineCount.tooHigh'),
    },
    initializer: async () =>
      (await configService.get('completion')).prefixLineCount,
    updateHandler: async (oldValue, newValue) => {
      try {
        newValue = Math.round(newValue);
        await updateNumberConfig('prefixLineCount', newValue);
        await sleep(Math.floor(200 + Math.random() * 300));
        return newValue;
      } catch (e) {
        console.error(e);
        return oldValue;
      }
    },
  },
  {
    title: i18n('numberProps.suffixLineCount.title'),
    caption: i18n('numberProps.suffixLineCount.caption'),
    defaultValue: DEFAULT_CONFIG_BASE.completion.suffixLineCount,
    minValue: NUMBER_CONFIG_CONSTRAINTS.completion.suffixLineCount.min,
    maxValue: NUMBER_CONFIG_CONSTRAINTS.completion.suffixLineCount.max,
    highThreshold: {
      value: NUMBER_CONFIG_CONSTRAINTS.completion.suffixLineCount.high,
      hint: i18n('numberProps.suffixLineCount.tooHigh'),
    },
    initializer: async () =>
      (await configService.get('completion')).suffixLineCount,
    updateHandler: async (oldValue, newValue) => {
      try {
        newValue = Math.round(newValue);
        await updateNumberConfig('suffixLineCount', newValue);
        await sleep(Math.floor(200 + Math.random() * 300));
        return newValue;
      } catch (e) {
        console.error(e);
        return oldValue;
      }
    },
  },
];

const refreshProductLineList = async () => {
  try {
    productLineLoading.value = true;
    const { username, activeTemplate } = await configService.getStore();
    console.log('username', username);
    console.log('activeTemplate', activeTemplate);

    productLineList.value = await api_getUserTemplateList(username);
    selectedProductLine.value = activeTemplate;
  } finally {
    productLineLoading.value = false;
  }
};

const refreshModelList = async () => {
  try {
    modelLoading.value = true;
    const activeModel = (await configService.get('activeModel')) ?? '';
    const templateFileContent = await api_getProductLineQuestionTemplateFile(
      selectedProductLine.value,
    );

    console.log('templateFileContent', templateFileContent, activeModel);

    const keys = Object.keys(templateFileContent);
    if (!keys.includes(activeModel)) {
      // 所选模型不在模板中
      await configService.set('activeModel', keys[0]);
      selectedModel.value = {
        label: templateFileContent[keys[0]].config.displayName,
        value: keys[0],
        modelKey: templateFileContent[keys[0]].config.modelKey,
      };
    }
    modelList.value = keys.map((key) => ({
      label: templateFileContent[key].config.displayName,
      value: key,
      modelKey: templateFileContent[key].config.modelKey,
    }));
    selectedModel.value = {
      label: templateFileContent[activeModel].config.displayName,
      value: activeModel,
      modelKey: templateFileContent[activeModel].config.modelKey,
    };
  } finally {
    modelLoading.value = false;
  }
};

const updateModel = async (model: {
  label: string;
  value: string;
  modelKey: string;
}) => {
  selectedModel.value = model;
  console.log('selectedModel', model, modelList.value);
  await configService.setConfigs({
    activeModel: model.value,
    activeModelKey: model.modelKey,
  });
  await dataStoreService.getActiveModelContent();
};

const updateProductLine = async (value: string) => {
  selectedProductLine.value = value;
  await configService.set('activeTemplate', value);
  await dataStoreService.getActiveModelContent();
  await refreshModelList();
};

onMounted(async () => {
  try {
    await refreshProductLineList();
    refreshModelList().catch();
  } catch (error) {
    console.error('onMounted error', error);
  }
});
</script>

<template>
  <q-card bordered flat>
    <q-card-section class="text-h5">
      {{ i18n('labels.title') }}
    </q-card-section>
    <q-list bordered separator>
      <q-expansion-item clickable group="completionSettingGroup">
        <template v-slot:header>
          <q-item-section>
            {{ i18n('labels.productLine') }}
          </q-item-section>
          <q-item-section side>
            <q-item-label>
              {{ selectedProductLine }}
            </q-item-label>
          </q-item-section>
        </template>
        <q-list>
          <q-item
            v-for="(item, index) in productLineList"
            :key="index"
            clickable
            @click="updateProductLine(item)"
          >
            <q-item-section class="q-pl-md">
              <q-item-label>
                {{ item }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-expansion-item>
      <q-expansion-item clickable group="completionSettingGroup">
        <template v-slot:header>
          <q-item-section>
            {{ i18n('labels.model') }}
          </q-item-section>
          <q-item-section side>
            <q-item-label>
              {{ selectedModel?.label }}
            </q-item-label>
          </q-item-section>
        </template>
        <q-list>
          <q-item
            v-for="(item, index) in modelList"
            :key="index"
            clickable
            @click="updateModel(item)"
          >
            <q-item-section class="q-pl-md">
              <q-item-label>
                {{ item.label }}
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label class="text-grey text-italic">
                {{ item.value }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-expansion-item>
      <item-number
        v-for="(numberSetting, index) in numberProps"
        :key="index"
        :title="numberSetting.title"
        :caption="numberSetting.caption"
        :suffix="numberSetting.suffix"
        :default-value="numberSetting.defaultValue"
        :min-value="numberSetting.minValue"
        :max-value="numberSetting.maxValue"
        :low-threshold="numberSetting.lowThreshold"
        :high-threshold="numberSetting.highThreshold"
        :initializer="numberSetting.initializer"
        :update-handler="numberSetting.updateHandler"
      />
    </q-list>
  </q-card>
</template>

<style scoped></style>
