<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { feedBack } from 'boot/axios';
import AccountInput from 'components/AccountInput.vue';

const { t } = useI18n();

const i18n = (relativePath: string) => {
  return t('pages.FeedbackPage.' + relativePath);
};

const description = ref('');
const error = ref(false);
const images = ref<string[]>([]);
const userId = ref('');

const onFailed = (info: { files: readonly File[]; xhr: XMLHttpRequest }) => {
  console.log('onFailed', info);
};
const onUploaded = (info: { files: readonly File[]; xhr: XMLHttpRequest }) => {
  if (info.xhr.status === 200) {
    images.value = JSON.parse(info.xhr.responseText);
  }
};

const submit = async () => {
  const { data } = await feedBack(
    description.value,
    userId.value,
    'SourceInsight 0.7.0',
    images.value
  );
  console.log(data);
};
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
            field-name="files"
            multiple
            url="http://rdee.h3c.com/kong/RdTestAiService-b/chatgpt/graph"
            @failed="onFailed"
            @uploaded="onUploaded"
          />
        </div>
      </q-card-section>
      <q-card-section class="column">
        <q-btn
          color="primary"
          :disable="
            !userId ||
            !userId.length ||
            !description ||
            !description.length ||
            error
          "
          :label="i18n('labels.submit')"
          @click="submit"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<style scoped></style>
