<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';

export interface Props {
  label: string;
  caption?: string;
  initializer?: () => Promise<boolean>;
  updateHandler: (newValue: boolean) => Promise<boolean>;
}

const props = defineProps<Props>();

const modelValue = ref(false);
const updating = ref(false);

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
        {{ label }}
      </q-item-label>
      <q-item-label v-if="caption" caption style="white-space: pre-line">
        {{ caption }}
      </q-item-label>
    </q-item-section>
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
