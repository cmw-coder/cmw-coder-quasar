<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';

import { useHighlighter } from 'stores/highlighter';

export interface Props {
  src: string;
}

const { t } = useI18n();
const { codeToHtml } = useHighlighter();

const i18n = (relativePath: string) => {
  return t('components.CodeBlock.' + relativePath);
};

const props = defineProps<Props>();

const codeContent = computed(() => codeToHtml(props.src, 'c'));
</script>

<template>
  <q-card v-if="codeContent.length" flat bordered>
    <q-card-section>
      <div
        class="shiki-codes"
        v-html="codeContent"
        style="word-wrap: break-word"
      />
    </q-card-section>
    <div class="column q-gutter-y-sm absolute-top-right q-pa-md">
      <q-btn color="grey" dense icon="content_copy" outline size="sm">
        <q-tooltip
          anchor="center left"
          self="center right"
          transition-hide="jump-right"
          transition-show="jump-left"
        >
          {{ i18n('tooltips.copy') }}
        </q-tooltip>
      </q-btn>
      <q-btn color="grey" dense icon="menu_open" outline size="sm">
        <q-tooltip
          anchor="center left"
          self="center right"
          transition-hide="jump-right"
          transition-show="jump-left"
        >
          {{ i18n('tooltips.insert') }}
        </q-tooltip>
      </q-btn>
    </div>
  </q-card>
</template>

<style scoped></style>
