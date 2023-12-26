<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import AccountInput from 'components/AccountInput.vue';
import { WindowType } from 'shared/types/WindowType';

const { t } = useI18n();
const { matched, query } = useRoute();

const i18n = (relativePath: string) => {
  return t('pages.LoginPage.' + relativePath);
};

const { name } = matched[matched.length - 2];
if (name == WindowType.Floating) {
  console.log('Floating');
}
console.log(query);

const account = ref(query.userId?.toString() ?? '');
const isLoading = ref(false);

const login = () => {
  isLoading.value = true;
  console.log(account.value);
  setTimeout(() => {
    isLoading.value = false;
  }, 1000);
};

</script>

<template>
  <q-page class="row flex-center q-pa-lg">
    <div class="col-10 column q-gutter-y-lg">
      <div class="text-h4">{{ i18n('labels.title') }}</div>
      <account-input v-model="account" :loading="isLoading" />
      <q-btn
        class="q-mt-md"
        color="primary"
        label="Login"
        :loading="isLoading"
        @click="login"
      />
    </div>
  </q-page>
</template>

<style scoped></style>
