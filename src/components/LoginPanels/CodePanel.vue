<script setup lang="ts">
import { useQuasar } from 'quasar';
import { computed, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { loginWithCode } from 'boot/axios';
import { sendAuthCode } from 'components/LoginPanels/utils';
import { StoreSaveActionMessage } from 'shared/types/ActionMessage';

const { t } = useI18n();
const { notify } = useQuasar();

const i18n = (relativePath: string) => {
  return t('components.LoginPanels.CodePanel.' + relativePath);
};

const emit = defineEmits(['finish', 'navigate']);

export interface Props {
  modelValue?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
});

const code = ref('');
const isLoginLoading = ref(false);
const isResendLoading = ref(false);

const codeInput = reactive({
  content: code,
  error: computed(() => {
    if (!code.value || !code.value.length) {
      return false;
    }
    return code.value.length !== 6;
  }),
  loading: false,
});

const getCode = async () => {
  isResendLoading.value = true;
  const result = await sendAuthCode(props.modelValue, i18n);
  if (result.type === 'positive') {
    notify({
      ...result,
      message: i18n('notifications.codeSent'),
    });
  } else {
    notify(result);
  }
  isResendLoading.value = false;
};

const goBack = () => {
  emit('navigate');
};

const login = async () => {
  isLoginLoading.value = true;
  try {
    const { data } = await loginWithCode(props.modelValue, code.value);
    if (data.error) {
      notify({
        type: 'warning',
        message: i18n('notifications.loginFailed'),
        caption: data.error,
      });
    } else {
      window.actionApi.send(
        new StoreSaveActionMessage({
          type: 'config',
          data: {
            userId: data.userId,
          },
        })
      );
      window.actionApi.send(
        new StoreSaveActionMessage({
          type: 'data',
          data: {
            tokens: {
              access: data.token,
              refresh: data.refreshToken,
            },
          },
        })
      );
      notify({
        type: 'positive',
        message: i18n('notifications.loginSuccess'),
      });
      setTimeout(() => {
        emit('finish');
      }, 2000);
    }
  } catch (e) {
    notify({
      type: 'negative',
      message: i18n('notifications.loginFailed'),
      caption: i18n('notifications.networkCaption'),
    });
  }
  isLoginLoading.value = false;
};
</script>

<template>
  <div class="column q-gutter-y-sm">
    <div
      class="text-center text-grey text-subtitle1"
      style="white-space: pre-line"
    >
      {{ i18n('labels.description') }}
    </div>
    <div
      class="row items-baseline justify-center text-center text-grey text-italic text-subtitle2"
      style="white-space: pre-line"
    >
      <div>
        {{ i18n('labels.resendBefore') }}
      </div>
      <q-btn
        class="text-bold text-primary"
        :label="i18n('labels.resend')"
        :loading="isResendLoading"
        dense
        flat
        no-caps
        @click="getCode"
      >
        <template v-slot:loading>
          {{ i18n('labels.resending') }}
          <q-spinner-dots class="on-right" />
        </template>
      </q-btn>
      <div>
        {{ i18n('labels.resendAfter') }}
      </div>
    </div>
    <div class="column q-gutter-y-xs">
      <div class="text-bold text-grey text-h6 q-px-xs">
        {{ i18n('labels.code') }}
      </div>
      <q-input
        clearable
        counter
        dense
        :error="codeInput.error"
        :loading="codeInput.loading"
        :maxlength="6"
        outlined
        v-model="code"
      >
        <template v-slot:error>
          <div>
            {{ i18n('errors.code') }}
          </div>
        </template>
      </q-input>
    </div>
    <q-btn
      color="primary"
      :disable="!code || !code.length || codeInput.error"
      :label="i18n('labels.signIn')"
      :loading="isLoginLoading"
      @click="login"
    />
    <q-btn
      color="primary"
      flat
      :label="i18n('labels.goBack')"
      @click="goBack"
    />
  </div>
</template>

<style scoped></style>
