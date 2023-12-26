<script setup lang="ts">
import { useQuasar } from 'quasar';
import { computed, reactive } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { screen } = useQuasar();

const emit = defineEmits(['update:modelValue']);

export interface Props {
  modelValue?: string;
  loading: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  loading: false,
});

const account = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const accountInput = reactive({
  content: account,
  error: computed(() => {
    if (!accountInput.content) {
      return false;
    }
    return accountInput.content.length < 5;
  }),
  loading: false,
});

const i18n = (relativePath: string) => {
  return t('components.AccountInput.' + relativePath);
};
</script>

<template>
  <q-input
    v-model.number="accountInput.content"
    :dense="!screen.gt.sm"
    :error="accountInput.error"
    :label="i18n('labels.account')"
    :loading="accountInput.loading"
    :maxlength="10"
    clearable
    outlined
  >
    <template v-slot:error>
      <div>
        {{ i18n('errors.account') }}
      </div>
    </template>
  </q-input>
</template>

<style scoped></style>
