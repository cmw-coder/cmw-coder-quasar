<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import { i18nSubPath } from 'utils/common';

export interface Props {
  title: string;
  caption?: string;
  suffix?: string;
  defaultValue?: number;
  minValue?: number;
  maxValue?: number;
  lowThreshold?: { value?: number; hint: string };
  highThreshold?: { value?: number; hint: string };
  initializer?: () => Promise<number>;
  updateHandler: (oldValue: number, newValue: number) => Promise<number>;
}

const props = defineProps<Props>();

const modelValue = ref(0);
const updating = ref(false);

const i18n = i18nSubPath('components.ItemNumberInput');

const updateModelValue = async (newValue: number | string | undefined) => {
  updating.value = true;

  newValue = Number(newValue);
  if (isNaN(newValue)) {
    console.warn('updateModelValue: newValue is not a number', newValue);
    return;
  }

  if (props.minValue !== undefined && newValue < props.minValue) {
    newValue = props.minValue;
  } else if (props.maxValue !== undefined && newValue > props.maxValue) {
    newValue = props.maxValue;
  }

  modelValue.value = await props.updateHandler(modelValue.value, newValue);
  updating.value = false;
};

onBeforeMount(async () => {
  if (props.initializer) {
    modelValue.value = await props.initializer();
  }
});
</script>

<template>
  <q-item>
    <q-item-section>
      <q-item-label>
        {{ title }}
      </q-item-label>
      <q-item-label v-if="caption" caption style="white-space: pre-line">
        {{ caption }}
      </q-item-label>
    </q-item-section>
    <div class="row self-center">
      <q-btn
        v-if="lowThreshold?.value !== undefined"
        v-show="modelValue < lowThreshold.value"
        color="warning"
        flat
        icon="mdi-alert"
        round
        size="sm"
        @click="updateModelValue(lowThreshold.value)"
      >
        <q-tooltip
          anchor="center left"
          self="center right"
          transition-show="jump-left"
          transition-hide="jump-right"
        >
          {{ lowThreshold.hint }}
        </q-tooltip>
      </q-btn>
      <q-btn
        v-if="highThreshold?.value !== undefined"
        v-show="modelValue > highThreshold.value"
        color="warning"
        flat
        icon="mdi-alert"
        round
        size="sm"
        @click="updateModelValue(highThreshold.value)"
      >
        <q-tooltip
          anchor="center left"
          self="center right"
          transition-show="jump-left"
          transition-hide="jump-right"
        >
          {{ highThreshold.hint }}
        </q-tooltip>
      </q-btn>
      <q-btn
        v-if="defaultValue !== undefined"
        v-show="modelValue !== defaultValue"
        color="grey"
        flat
        icon="mdi-restore"
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
      <q-input
        dense
        input-class="text-right"
        :maxlength="maxValue?.toString().length"
        :model-value="modelValue"
        @change="updateModelValue"
        input-style="width: 4em"
      >
        <template v-slot:after>
          <div class="text-body2">
            {{ suffix }}
          </div>
        </template>
      </q-input>
    </q-item-section>
    <q-inner-loading :showing="updating">
      <q-spinner-gears size="lg" color="grey" />
    </q-inner-loading>
  </q-item>
</template>

<style scoped></style>
