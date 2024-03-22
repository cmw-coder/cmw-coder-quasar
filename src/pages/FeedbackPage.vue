<script setup lang="ts">
import { useQuasar } from 'quasar';
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import packageJson from 'app/package.json';
import { feedBack } from 'boot/axios';
import AccountInput from 'components/AccountInput.vue';
import {
  ActionType,
  ConfigStoreLoadActionMessage,
} from 'shared/types/ActionMessage';
import { ActionApi } from 'types/ActionApi';
import { WindowType } from 'shared/types/WindowType';
import { ApiStyle } from 'shared/types/model';

const baseName = 'pages.FeedbackPage.';

const { t } = useI18n();
const { notify } = useQuasar();
const { matched } = useRoute();
const { back } = useRouter();

const i18n = (relativePath: string) => {
  return t(baseName + relativePath);
};

const { name } = matched[matched.length - 2];

const accessToken = ref('');
const description = ref('');
const endpoint = ref('');
const error = ref(false);
const images = ref<string[]>([]);
const loading = ref(false);
const userId = ref('');
const version = ref(packageJson.version);

const onFailed = (info: { files: readonly File[]; xhr: XMLHttpRequest }) => {
  console.log('onFailed', info);
};
const onUploaded = (info: { files: readonly File[]; xhr: XMLHttpRequest }) => {
  if (info.xhr.status === 200) {
    images.value = JSON.parse(info.xhr.responseText);
  }
};

const closeWindow = () => window.controlApi.hide(WindowType.Floating);

const submit = async () => {
  loading.value = true;
  try {
    const { data } = await feedBack(
      endpoint.value,
      accessToken.value,
      description.value,
      userId.value,
      `Comware Coder ${version.value}`,
      images.value,
    );
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

const actionApi = new ActionApi(baseName);
onMounted(() => {
  actionApi.register(
    ActionType.ConfigStoreLoad,
    ({ apiStyle, config, data }) => {
      if (apiStyle == ApiStyle.Linseer) {
        accessToken.value = data.tokens.access;
      }
      endpoint.value = config.endpoints.aiService;
      userId.value = config.userId;
    },
  );
  window.actionApi.send(new ConfigStoreLoadActionMessage());
});
onBeforeUnmount(() => {
  actionApi.unregister();
});
</script>

<template>
  <q-page class="row justify-evenly q-pa-xl">
    <q-card class="col-grow q-pa-lg">
      <q-card-section class="text-h4 text-center">
        {{ i18n('labels.title') }}
      </q-card-section>
      <q-card-section class="column q-gutter-y-md">
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
            :disable="!endpoint.length || loading"
            field-name="files"
            multiple
            :url="`${endpoint}/chatgpt/graph`"
            @failed="onFailed"
            @uploaded="onUploaded"
          />
        </div>
      </q-card-section>
      <q-card-section class="row q-gutter-x-md">
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
            !endpoint.length ||
            !userId ||
            !userId.length ||
            !version.length ||
            error
          "
          :label="i18n('labels.submit')"
          :loading="loading"
          @click="submit"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<style scoped></style>
