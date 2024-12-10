<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';

export interface Props {
  label: string;
  caption?: string;
  suffix?: string;
  defaultValue?: number;
  resetTooltip?: string;
  initializer?: () => Promise<number>;
  updateHandler: (oldValue: number, newValue: number) => Promise<number>;
}

const props = defineProps<Props>();

const modelValue = ref(0);
const updating = ref(false);

const updateModelValue = async (newValue: number | string |  undefined) => {
  updating.value = true;
  modelValue.value = await props.updateHandler(modelValue.value, Number(newValue));
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
        {{ label }}
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
          v-if="resetTooltip?.length"
          anchor="center left"
          self="center right"
          transition-show="jump-left"
          transition-hide="jump-right"
        >
          {{ resetTooltip }}
        </q-tooltip>
      </q-btn>
    </div>
    <q-item-section side>
      <q-input
        dense
        input-class="text-right"
        maxlength="3"
        :suffix="suffix"
        :model-value="modelValue"
        @change="updateModelValue"
      />
    </q-item-section>
    <q-inner-loading :showing="updating">
      <q-spinner-gears size="lg" color="grey" />
    </q-inner-loading>
  </q-item>
</template>

<style scoped></style>
