<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const i18n = (relativePath: string) => {
  return t('components.AccountInput.' + relativePath);
};

const emit = defineEmits(['update:error', 'update:modelValue']);

export interface Props {
  modelValue: string;
}

const props = defineProps<Props>();

const error = ref(false);

const account = computed({
  get: () => props.modelValue,
  set: (accountValue) => {
    if (!accountValue || !accountValue.length) {
      error.value = false;
    } else {
      error.value = accountValue.length < 5;
    }
    emit('update:error', error.value);
    emit('update:modelValue', accountValue);
  },
});

const loading = ref(false);
</script>

<template>
  <div class="column q-gutter-y-sm">
    <div class="text-bold text-grey text-h6 q-px-xs">
      {{ i18n('labels.account') }}
    </div>
    <q-input
      dense
      :error="error"
      :hint="i18n('hints.account')"
      :loading="loading"
      :maxlength="7"
      outlined
      v-model="account"
    >
      <template v-slot:error>
        <div>
          {{ i18n('errors.account') }}
        </div>
      </template>
    </q-input>
  </div>
</template>

<style scoped></style>
