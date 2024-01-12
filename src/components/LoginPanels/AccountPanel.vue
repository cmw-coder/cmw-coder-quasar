<script setup lang="ts">
import { useQuasar } from 'quasar';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { sendAuthCode } from 'components/LoginPanels/utils';
import AccountInput from 'components/AccountInput.vue';

const { t } = useI18n();
const { notify } = useQuasar();

const i18n = (relativePath: string) => {
  return t('components.LoginPanels.AccountPanel.' + relativePath);
};

const emit = defineEmits(['update:modelValue', 'finish', 'navigate']);

export interface Props {
  modelValue?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
});

const account = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const error = ref(false);

const isLoading = ref(false);

const checkAccount = async () => {
  isLoading.value = true;
  const result = await sendAuthCode(props.modelValue, i18n);
  if (result.type === 'positive') {
    emit('navigate');
  } else {
    notify(result);
  }
  isLoading.value = false;
};
</script>

<template>
  <div class="column q-gutter-y-sm">
    <div class="text-center text-grey text-h6" style="white-space: pre-line">
      {{ i18n('labels.intro') }}
    </div>
    <div
      class="text-center text-grey text-italic text-subtitle1"
      style="white-space: pre-line"
    >
      {{ i18n('labels.description') }}
    </div>
    <account-input v-model="account" @update:error="error = $event" />
    <q-btn
      color="primary"
      :disable="!account || !account.length || error"
      :label="i18n('labels.continue')"
      :loading="isLoading"
      @click="checkAccount"
    />
    <q-skeleton class="invisible" type="QBtn" />
  </div>
</template>

<style scoped></style>
