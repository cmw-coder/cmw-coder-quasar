<script setup lang="ts">
import { useQuasar } from 'quasar';
import { computed, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { api_checkAuthCode, api_getAuthCode } from 'src/request/login';
import { useService } from 'utils/common';
import { ServiceType } from 'shared/types/service';

const { t } = useI18n();
const { notify } = useQuasar();

const i18n = (relativePath: string) => {
  return t('components.LoginPanels.CodePanel.' + relativePath);
};

const emit = defineEmits(['finish', 'navigate']);

const configService = useService(ServiceType.CONFIG);
const windowService = useService(ServiceType.WINDOW);

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
  try {
    await api_getAuthCode(props.modelValue);
    notify({
      type: 'positive',
      message: i18n('notifications.codeSent'),
    });
  } catch (error) {
    notify({
      type: 'negative',
      message: i18n('notifications.codeFailed'),
      caption: (error as Error).message,
    });
  }
  isResendLoading.value = false;
};

const goBack = () => {
  emit('navigate');
};

const login = async () => {
  isLoginLoading.value = true;
  try {
    const { userId, token, refreshToken, error } = await api_checkAuthCode(
      props.modelValue,
      code.value.trim(),
    );
    if (error) {
      notify({
        type: 'negative',
        message: i18n('notifications.loginFailed'),
        caption: error,
      });
    }
    await configService.setConfigs({
      username: userId,
      token,
      refreshToken,
    });
    windowService.finishLogin().catch((error) => {
      notify({
        type: 'negative',
        message: i18n('notifications.loginFailed'),
        caption: error.message,
      });
    });
  } catch (error) {
    notify({
      type: 'negative',
      message: i18n('notifications.loginFailed'),
      caption: (error as Error).message,
    });
  } finally {
    isLoginLoading.value = false;
  }
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
