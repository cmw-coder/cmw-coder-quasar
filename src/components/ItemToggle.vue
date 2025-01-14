<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import { i18nSubPath } from 'utils/common';

export interface Props {
  title: string;
  caption?: string;
  defaultValue?: boolean;
  initializer?: () => Promise<boolean>;
  updateHandler: (newValue: boolean) => Promise<boolean>;
}

const props = defineProps<Props>();

const modelValue = ref(false);
const updating = ref(false);

const i18n = i18nSubPath('components.ItemToggle');

const updateModelValue = async (newValue: boolean) => {
  updating.value = true;
  const oldValue = modelValue.value;
  modelValue.value = newValue;
  if (!(await props.updateHandler(newValue))) {
    modelValue.value = oldValue;
  }
  updating.value = false;
};

onBeforeMount(async () => {
  if (props.initializer) {
    modelValue.value = await props.initializer();
  }
});
</script>

<template>
  <q-item tag="label">
    <q-item-section>
      <q-item-label>
        {{ title }}
      </q-item-label>
      <q-item-label v-if="caption" caption style="white-space: pre-line">
        {{ caption }}
      </q-item-label>
    </q-item-section>
    <div class="self-center">
      <q-btn
        v-if="defaultValue !== undefined"
        v-show="modelValue !== defaultValue"
        flat
        icon="refresh"
        round
        size="sm"
        @click="updateModelValue(defaultValue)"
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
      <q-toggle
        :model-value="modelValue"
        @update:model-value="updateModelValue($event)"
      />
    </q-item-section>
    <q-inner-loading :showing="updating">
      <q-spinner-gears size="lg" color="grey" />
    </q-inner-loading>
  </q-item>
</template>

<style scoped></style>
