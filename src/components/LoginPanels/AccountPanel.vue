<script setup lang="ts">
import { useQuasar } from 'quasar';
import { computed, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { sendAuthCode } from 'components/LoginPanels/utils';

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

const accountInput = reactive({
  content: account,
  error: computed(() => {
    if (!account.value || !account.value.length) {
      return false;
    }
    return account.value.length < 5;
  }),
  loading: false,
});

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
    <div class="column q-gutter-y-xs">
      <div class="text-bold text-grey text-h6 q-px-xs">
        {{ i18n('labels.account') }}
      </div>
      <q-input
        clearable
        dense
        :error="accountInput.error"
        :hint="i18n('hints.account')"
        :loading="accountInput.loading"
        :maxlength="10"
        outlined
        v-model="accountInput.content"
      >
        <template v-slot:error>
          <div>
            {{ i18n('errors.account') }}
          </div>
        </template>
      </q-input>
    </div>
    <q-btn
      color="primary"
      :disable="!account || !account.length || accountInput.error"
      :label="i18n('labels.continue')"
      :loading="isLoading"
      @click="checkAccount"
    />
    <q-skeleton class="invisible" type="QBtn" />
  </div>
</template>

<style scoped></style>
