<script setup lang="ts">
import { copyToClipboard, Notify, useDialogPluginComponent } from 'quasar';
import { computed, ref } from 'vue';

import { useHighlighter } from 'stores/highlighter';
import { i18nSubPath } from 'utils/common';

const props = defineProps<{
  title: string;
  buffer: ArrayBuffer;
}>();

defineEmits([...useDialogPluginComponent.emits]);

const baseName = 'components.CodeViewDialog';
const encodingOptions = [
  { label: 'GBK', value: 'gbk' },
  { label: 'UTF-8', value: 'utf-8' },
];

const { dialogRef, onDialogHide, onDialogCancel } = useDialogPluginComponent();
const { codeToHtml } = useHighlighter();

const encoding = ref(encodingOptions[0]);

const content = computed(() =>
  new TextDecoder(encoding.value.value).decode(props.buffer),
);

const i18n = i18nSubPath(baseName);

const copyContent = () => {
  copyToClipboard(content.value)
    .then(() => {
      Notify.create({
        type: 'positive',
        message: i18n('notifications.copySuccess'),
      });
    })
    .catch(() => {
      Notify.create({
        type: 'positive',
        message: i18n('notifications.copyFailed'),
      });
    });
};
</script>

<template>
  <q-dialog ref="dialogRef" full-width @hide="onDialogHide">
    <q-card class="q-dialog-plugin">
      <q-card-section>
        <div class="row items-baseline justify-between">
          <div class="text-body1">{{ props.title }}</div>
          <q-select
            class="col-auto"
            :label="i18n('labels.encoding')"
            :options="encodingOptions"
            outlined
            v-model="encoding"
            style="min-width: 10rem"
          />
        </div>
      </q-card-section>
      <q-separator />
      <q-scroll-area style="height: 80vh">
        <div
          v-if="content.split('\n').length <= 5000"
          class="q-mx-sm"
          v-html="codeToHtml(content, 'c')"
        />
        <div v-else class="column q-px-sm">
          <q-banner
            class="bg-warning text-white"
            dense
            rounded
          >
            {{ i18n('labels.tooManyLines') }}
          </q-banner>
          <code style="white-space: pre-line">
            {{ content }}
          </code>
        </div>
      </q-scroll-area>
      <q-card-actions align="right">
        <q-btn
          color="primary"
          icon="mdi-content-copy"
          :label="i18n('labels.copy')"
          @click="copyContent"
        />
        <q-btn
          color="primary"
          :label="i18n('labels.dismiss')"
          @click="onDialogCancel"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style lang="scss">
code {
  counter-reset: step;
  counter-increment: step 0;
}

code .line::before {
  content: counter(step);
  counter-increment: step;
  width: 1rem;
  margin-right: 1.5rem;
  display: inline-block;
  text-align: right;
  color: rgba(115, 138, 148, 0.4);
}
</style>
