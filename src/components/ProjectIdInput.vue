<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const i18n = (relativePath: string) => {
  return t('components.ProjectIdInput.' + relativePath);
};

const emit = defineEmits(['update:error', 'update:modelValue']);

export interface Props {
  modelValue: string;
}

const props = defineProps<Props>();

const error = ref(false);

const projectId = computed({
  get: () => props.modelValue,
  set: (projectIdValue) => {
    if (!projectIdValue || !projectIdValue.length) {
      error.value = false;
    } else {
      error.value = !(
        /^NV[0-9]{12}$/.test(projectIdValue) ||
        /^TB[0-9]{12}$/.test(projectIdValue)
      );
    }
    emit('update:error', error.value);
    emit('update:modelValue', projectIdValue);
  },
});

const loading = ref(false);
</script>

<template>
  <div class="column q-gutter-y-sm">
    <div class="text-bold text-grey text-h6 q-px-xs">
      {{ i18n('labels.projectId') }}
    </div>
    <q-input
      dense
      :error="error"
      :hint="i18n('hints.projectId')"
      :loading="loading"
      :maxlength="14"
      outlined
      v-model="projectId"
    >
      <template v-slot:error>
        <div>
          {{ i18n('errors.projectId') }}
        </div>
      </template>
    </q-input>
  </div>
</template>

<style scoped></style>
