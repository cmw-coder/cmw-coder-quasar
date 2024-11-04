<script setup lang="ts">
import { onMounted, reactive, ref, toRaw } from 'vue';
import { useI18n } from 'vue-i18n';

import { COMPLETION_CONFIG_CONSTANTS } from 'shared/constants/config';
import { ServiceType } from 'shared/types/service';
import { AppConfig } from 'shared/types/service/ConfigServiceTrait/types';
import { SettingSyncServerMessage } from 'shared/types/WsMessage';
import {
  api_getProductLineQuestionTemplateFile,
  api_getUserTemplateList,
} from 'src/request/api';
import { useService } from 'utils/common';
import { sleep } from '@volar/language-server/lib/register/registerLanguageFeatures';

const baseName = 'components.SettingCards.CompletionCard.';

const { t } = useI18n();

const i18n = (relativePath: string, data?: Record<string, unknown>) => {
  if (data) {
    return t(baseName + relativePath, data);
  } else {
    return t(baseName + relativePath);
  }
};

const configService = useService(ServiceType.CONFIG);
const dataStoreService = useService(ServiceType.DATA_STORE);
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
const completionConfig = reactive({
  debounceDelay: COMPLETION_CONFIG_CONSTANTS.debounceDelay.default,
  interactionUnlockDelay:
    COMPLETION_CONFIG_CONSTANTS.interactionUnlockDelay.default,
  prefixLineCount: COMPLETION_CONFIG_CONSTANTS.prefixLineCount.default,
  suffixLineCount: COMPLETION_CONFIG_CONSTANTS.suffixLineCount.default,
});
const completionConfigLoading = reactive({
  debounceDelay: false,
  interactionUnlockDelay: false,
  prefixLineCount: false,
  suffixLineCount: false,
});

const refreshProductLineList = async () => {
  try {
    productLineLoading.value = true;
    const { username, activeTemplate } = await configService.getConfigs();

    productLineList.value = await api_getUserTemplateList(username);
    selectedProductLine.value = activeTemplate;
  } finally {
    productLineLoading.value = false;
  }
};

const refreshModelList = async () => {
  try {
    modelLoading.value = true;
    const activeModel = (await configService.getConfig('activeModel')) ?? '';
    const templateFileContent = await api_getProductLineQuestionTemplateFile(
      selectedProductLine.value,
    );

    console.log('templateFileContent', templateFileContent, activeModel);

    const keys = Object.keys(templateFileContent);
    if (!keys.includes(activeModel)) {
      // 所选模型不在模板中
      await configService.setConfig('activeModel', keys[0]);
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

const refreshCompletionConfig = async () => {
  try {
    const completion = await configService.getConfig('completion');
    if (completion?.debounceDelay !== undefined) {
      completionConfig.debounceDelay = completion.debounceDelay;
    }
    if (completion?.interactionUnlockDelay !== undefined) {
      completionConfig.interactionUnlockDelay =
        completion.interactionUnlockDelay;
    }
    if (completion?.prefixLineCount !== undefined) {
      completionConfig.prefixLineCount = completion.prefixLineCount;
    }
    if (completion?.suffixLineCount !== undefined) {
      completionConfig.suffixLineCount = completion.suffixLineCount;
    }
  } catch (error) {
    console.error('refreshCompletionConfig', error);
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
  await configService.setConfig('activeTemplate', value);
  await dataStoreService.getActiveModelContent();
  await refreshModelList();
};

const updateCompletionConfig = async (
  key: keyof AppConfig['completion'],
  value: string | number | null,
) => {
  let configSetter: (data: number) => void;
  let configLoadingSetter: () => void;
  let constants: {
    default: number;
    min: number;
    max: number;
  };
  switch (key) {
    case 'debounceDelay': {
      completionConfigLoading.debounceDelay = true;
      configSetter = (data: number) => (completionConfig.debounceDelay = data);
      configLoadingSetter = () =>
        (completionConfigLoading.debounceDelay = false);
      constants = COMPLETION_CONFIG_CONSTANTS.debounceDelay;
      break;
    }
    case 'interactionUnlockDelay': {
      completionConfigLoading.interactionUnlockDelay = true;
      configSetter = (data: number) =>
        (completionConfig.interactionUnlockDelay = data);
      configLoadingSetter = () =>
        (completionConfigLoading.interactionUnlockDelay = false);
      constants = COMPLETION_CONFIG_CONSTANTS.interactionUnlockDelay;
      break;
    }
    case 'prefixLineCount': {
      completionConfigLoading.prefixLineCount = true;
      configSetter = (data: number) =>
        (completionConfig.prefixLineCount = data);
      configLoadingSetter = () =>
        (completionConfigLoading.prefixLineCount = false);
      constants = COMPLETION_CONFIG_CONSTANTS.prefixLineCount;
      break;
    }
    case 'suffixLineCount': {
      completionConfigLoading.suffixLineCount = true;
      configSetter = (data: number) =>
        (completionConfig.suffixLineCount = data);
      configLoadingSetter = () =>
        (completionConfigLoading.suffixLineCount = false);
      constants = COMPLETION_CONFIG_CONSTANTS.suffixLineCount;
      break;
    }
    default: {
      console.warn('updateCompletionConfig', 'key not found', key);
      return;
    }
  }
  if (value === null) {
    configSetter(constants.min);
  } else {
    value = Number(value);
    if (value < constants.min) {
      configSetter(constants.min);
    } else if (value > COMPLETION_CONFIG_CONSTANTS.debounceDelay.max) {
      configSetter(constants.max);
    } else if (!isNaN(value)) {
      configSetter(value);
    } else {
      console.warn('updateCompletionConfig', 'value is not a number', value);
      return;
    }
  }
  websocketService.send(
    JSON.stringify(
      new SettingSyncServerMessage({
        result: 'success',
        completionConfig: { [key]: completionConfig[key] },
      }),
    ),
  );
  await configService.setConfig('completion', toRaw(completionConfig));
  await sleep(Math.floor(200 + Math.random() * 300));
  configLoadingSetter();
};

onMounted(() => {
  refreshProductLineList().catch();
  refreshModelList().catch();
  refreshCompletionConfig().catch();
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
      <q-item v-for="(value, key, index) in completionConfig" :key="index">
        <q-item-section>
          <div class="row items-baseline q-gutter-x-lg">
            <q-item-label>
              {{ i18n(`labels.${key}`) }}
            </q-item-label>
            <q-item-label caption>
              {{
                i18n('labels.rangeHint', {
                  min: COMPLETION_CONFIG_CONSTANTS[key].min,
                  max: COMPLETION_CONFIG_CONSTANTS[key].max,
                })
              }}
            </q-item-label>
          </div>
        </q-item-section>
        <div class="self-center">
          <q-btn
            v-show="value !== COMPLETION_CONFIG_CONSTANTS[key].default"
            flat
            icon="refresh"
            round
            size="sm"
            @click="
              updateCompletionConfig(
                key,
                COMPLETION_CONFIG_CONSTANTS[key].default,
              )
            "
          >
            <q-tooltip
              anchor="center left"
              self="center right"
              transition-show="jump-left"
              transition-hide="jump-right"
            >
              {{ i18n('tooltips.resetToDefault') }}
            </q-tooltip>
          </q-btn>
        </div>
        <q-item-section side>
          <q-input
            dense
            input-class="text-right"
            maxlength="3"
            suffix="ms"
            style="max-width: 3.5rem"
            :model-value="value"
            @change="updateCompletionConfig(key, $event)"
          />
        </q-item-section>
        <q-inner-loading :showing="completionConfigLoading[key]">
          <q-spinner-gears size="lg" color="grey" />
        </q-inner-loading>
      </q-item>
    </q-list>
  </q-card>
</template>

<style scoped></style>
