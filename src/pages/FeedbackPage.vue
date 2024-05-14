<script setup lang="ts">
import { useQuasar } from 'quasar';
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import packageJson from 'app/package.json';
import AccountInput from 'components/AccountInput.vue';
import { WindowType } from 'shared/types/WindowType';
import { api_feedback } from 'src/request/api';
import { useService } from 'utils/common';
import { ServiceType } from 'shared/services';

const baseName = 'pages.FeedbackPage.';

const { t } = useI18n();
const { notify } = useQuasar();
const { matched } = useRoute();
const { back } = useRouter();

const configService = useService(ServiceType.CONFIG);
const windowService = useService(ServiceType.WINDOW);

const i18n = (relativePath: string) => {
  return t(baseName + relativePath);
};

const { name } = matched[matched.length - 2];

const description = ref('');
const error = ref(false);
const images = ref<string[]>([]);
const loading = ref(false);
const userId = ref('');
const baseUrl = ref('');
const version = ref(packageJson.version);

const onFailed = (info: { files: readonly File[]; xhr: XMLHttpRequest }) => {
  console.log('onFailed', info);
};
const onUploaded = (info: { files: readonly File[]; xhr: XMLHttpRequest }) => {
  if (info.xhr.status === 200) {
    images.value = JSON.parse(info.xhr.responseText);
  }
};

const closeWindow = () => {
  windowService.closeWindow(WindowType.Feedback);
};

const submit = async () => {
  loading.value = true;
  try {
    const data = await api_feedback({
      description: description.value,
      userId: userId.value,
      pictures: images.value,
      version: `Comware Coder ${version.value}`,
    });
    notify({
      type: 'positive',
      message: i18n('notifications.feedbackSuccess'),
      caption: data,
    });
    setTimeout(() => {
      switch (name) {
        case WindowType.Floating: {
          closeWindow();
          break;
        }
        case WindowType.Main: {
          back();
          break;
        }
        default: {
          break;
        }
      }
    }, 2000);
  } catch (e) {
    console.warn(e);
    notify({
      type: 'negative',
      message: i18n('notifications.feedbackFailed'),
    });
  }
  loading.value = false;
};

onMounted(async () => {
  const appConfig = await configService.getConfigs();
  userId.value = appConfig.username;
  baseUrl.value = appConfig.baseServerUrl;
});
</script>

<template>
  <q-page class="row items-center justify-evenly q-pa-xl">
    <div class="column col-grow q-gutter-y-md">
      <div class="text-h4 text-center">
        {{ i18n('labels.title') }}
      </div>
      <div class="column q-gutter-y-md">
        <account-input v-model="userId" @update:error="error = $event" />
        <div class="column q-gutter-y-sm">
          <div class="text-bold text-grey text-h6">
            {{ i18n('labels.description') }}
          </div>
          <q-input
            counter
            dense
            :maxlength="400"
            outlined
            type="textarea"
            v-model="description"
          />
        </div>
        <div class="column q-gutter-y-sm">
          <div class="text-bold text-grey text-h6">
            {{ i18n('labels.images') }}
          </div>
          <q-uploader
            class="full-width"
            batch
            :disable="!baseUrl.length || loading"
            field-name="files"
            multiple
            :url="`${baseUrl}/kong/RdTestAiService-b/chatgpt/graph`"
            @failed="onFailed"
            @uploaded="onUploaded"
          />
        </div>
      </div>
      <div class="row q-gutter-x-md">
        <q-btn
          v-if="name === WindowType.Floating"
          class="col-grow"
          flat
          :label="i18n('labels.cancel')"
          :loading="loading"
          @click="closeWindow"
        />
        <q-btn
          class="col-grow"
          color="primary"
          :disable="
            !description ||
            !description.length ||
            !baseUrl.length ||
            !userId ||
            !userId.length ||
            !version.length ||
            error
          "
          :label="i18n('labels.submit')"
          :loading="loading"
          @click="submit"
        />
      </div>
    </div>
  </q-page>
</template>

<style scoped></style>
