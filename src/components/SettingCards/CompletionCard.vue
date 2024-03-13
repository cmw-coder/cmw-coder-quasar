<script setup lang="ts">
import { QExpansionItem } from 'quasar';
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import {
  HuggingFaceModelConfigType,
  LinseerModelConfigType,
} from 'app/src-electron/main/stores/config/types';
import {
  ActionType,
  ConfigStoreLoadActionMessage,
  ConfigStoreSaveActionMessage,
  DataStoreLoadActionMessage,
  DataStoreSaveActionMessage,
} from 'shared/types/ActionMessage';
import { HuggingFaceModelType, LinseerModelType } from 'shared/types/model';
import { ActionApi } from 'types/ActionApi';

const baseName = 'components.SettingCards.CompletionCard.';

const { t } = useI18n();

const i18n = (relativePath: string, data?: Record<string, unknown>) => {
  if (data) {
    return t(baseName + relativePath, data);
  } else {
    return t(baseName + relativePath);
  }
};

const availableModels = ref<HuggingFaceModelType[] | LinseerModelType[]>([]);
const modelUpdating = ref(false);
const modelSelectItem = ref<QExpansionItem>();
const modelType = ref<HuggingFaceModelType | LinseerModelType>();
const dipMapping = ref<boolean>();
const dipMappingUpdating = ref(false);

const updateModelType = (model: HuggingFaceModelType | LinseerModelType) => {
  modelUpdating.value = true;
  window.actionApi.send(
    new ConfigStoreSaveActionMessage({
      type: 'data',
      data: {
        modelType: model,
      },
    }),
  );
  setTimeout(
    () => {
      window.actionApi.send(new ConfigStoreLoadActionMessage());
    },
    300 + Math.random() * 700,
  );
};

const updateDipMapping = (value: boolean) => {
  dipMappingUpdating.value = true;
  window.actionApi.send(
    new DataStoreSaveActionMessage({
      type: 'window',
      data: {
        dipMapping: value,
      },
    }),
  );
  setTimeout(
    () => {
      window.actionApi.send(new DataStoreLoadActionMessage());
    },
    300 + Math.random() * 700,
  );
};

const actionApi = new ActionApi(baseName);
onMounted(() => {
  actionApi.register(ActionType.ConfigStoreLoad, (data) => {
    if (data) {
      availableModels.value = data.config.modelConfigs.map(
        (modelConfig: LinseerModelConfigType | HuggingFaceModelConfigType) =>
          modelConfig.modelType,
      );
      modelType.value = data.data.modelType;
      modelUpdating.value = false;
      modelSelectItem.value?.hide();
    }
  });
  actionApi.register(ActionType.DataStoreLoad, (data) => {
    if (data) {
      dipMapping.value = data.window.dipMapping;
      dipMappingUpdating.value = false;
    }
  });
  window.actionApi.send(new ConfigStoreLoadActionMessage());
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
      <q-expansion-item ref="modelSelectItem" clickable group="settingGroup">
        <template v-slot:header>
          <q-item-section>
            {{ i18n('labels.currentModel') }}
          </q-item-section>
          <q-item-section v-if="modelType" side>
            <div>{{ i18n(`labels.availableModels.${modelType}`) }}</div>
          </q-item-section>
        </template>
        <div
          v-show="modelUpdating"
          class="absolute-full row items-center justify-center"
          style="background-color: rgba(0, 0, 0, 0.4)"
        >
          <q-spinner size="6rem" />
        </div>
        <q-list>
          <q-item
            v-for="(model, index) in availableModels"
            :key="index"
            clickable
            :disable="modelUpdating"
            @click="updateModelType(model)"
          >
            <q-item-section>
              {{ i18n(`labels.availableModels.${model}`) }}
            </q-item-section>
          </q-item>
        </q-list>
      </q-expansion-item>
      <q-item :disable="dipMappingUpdating" tag="label">
        <q-item-section>
          {{ i18n('labels.dipMapping') }}
        </q-item-section>
        <q-item-section side>
          <div class="row items-center">
            <q-spinner v-show="dipMappingUpdating" size="sm" />
            <q-toggle
              :disable="dipMappingUpdating"
              :model-value="dipMapping"
              @update:model-value="updateDipMapping($event)"
            />
          </div>
        </q-item-section>
      </q-item>
    </q-list>
  </q-card>
</template>

<style scoped></style>