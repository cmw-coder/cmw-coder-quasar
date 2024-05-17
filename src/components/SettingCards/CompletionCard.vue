<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  api_getProductLineQuestionTemplateFile,
  api_getUserTemplateList,
} from 'src/request/api';
import { useService } from 'utils/common';
import { ServiceType } from 'shared/types/service';

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

const productLineList = ref(<string[]>[]);
const modelList = ref(
  <
    {
      label: string;
      value: string;
      modelKey: string;
    }[]
  >[],
);
const modelStringList = computed(() =>
  modelList.value.map((item) => item.label),
);
const productLineLoading = ref(false);
const selectedProductLine = ref('');
const modelLoading = ref(false);
const selectedModel = ref('');

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
    const { activeModel } = await configService.getConfigs();
    const templateFileContent = await api_getProductLineQuestionTemplateFile(
      selectedProductLine.value,
    );
    const keys = Object.keys(templateFileContent);
    if (!keys.includes(activeModel)) {
      // 所选模型不在模板中
      await configService.setConfig('activeModel', keys[0]);
      selectedModel.value = templateFileContent[keys[0]].config.displayName;
    }
    modelList.value = keys.map((key) => ({
      label: templateFileContent[key].config.displayName,
      value: key,
      modelKey: templateFileContent[key].config.modelKey,
    }));
    selectedModel.value = templateFileContent[activeModel].config.displayName;
  } finally {
    modelLoading.value = false;
  }
};

onMounted(async () => {
  await refreshProductLineList();
  await refreshModelList();
});

watch(
  () => selectedProductLine.value,
  async (value) => {
    if (value) {
      await configService.setConfig('activeTemplate', value);
      await dataStoreService.getActiveModelContent();
      await refreshModelList();
    }
  },
);

watch(
  () => selectedModel.value,
  async (value) => {
    if (value) {
      console.log('selectedModel', value, modelList.value);
      const data = modelList.value.find((item) => item.label === value);
      if (!data) {
        return;
      }
      await configService.setConfigs({
        activeModel: data.value,
        activeModelKey: data.modelKey,
      });
      await dataStoreService.getActiveModelContent();
    }
  },
);
</script>

<template>
  <q-card bordered flat>
    <q-card-section class="text-h5">
      {{ i18n('labels.title') }}
    </q-card-section>
    <q-list bordered separator>
      <q-item>
        <q-select
          v-if="!productLineLoading"
          style="width: 100%"
          square
          outlined
          v-model="selectedProductLine"
          :options="productLineList"
          :label="i18n('labels.productLine')"
        />
      </q-item>
      <q-item>
        <q-select
          v-if="!modelLoading"
          style="width: 100%"
          square
          outlined
          v-model="selectedModel"
          :options="modelStringList"
          :label="i18n('labels.model')"
        />
      </q-item>
    </q-list>
  </q-card>
</template>

<style scoped></style>
