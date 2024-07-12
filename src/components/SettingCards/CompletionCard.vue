<script setup lang="ts">
import { onMounted, ref } from 'vue';
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

onMounted(async () => {
  await refreshProductLineList();
  await refreshModelList();
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
    </q-list>
  </q-card>
</template>

<style scoped></style>
