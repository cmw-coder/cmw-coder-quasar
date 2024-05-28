<script setup lang="ts">
import { useI18n } from 'vue-i18n';

export interface Props {
  html: string;
}

defineProps<Props>();

const { t } = useI18n();

const i18n = (relativePath: string) => {
  return t('components.CodeBlock.' + relativePath);
};

const emit = defineEmits(['copy', 'insert']);
</script>

<template>
  <div>
    <div class="shiki-codes" v-html="html" style="word-wrap: break-word" />
    <div class="row q-gutter-x-sm absolute-top-right q-pa-md">
      <q-btn
        color="grey-7"
        dense
        icon="content_copy"
        outline
        size="sm"
        @click="emit('copy')"
      >
        <q-tooltip
          anchor="bottom middle"
          self="top middle"
          transition-hide="jump-up"
          transition-show="jump-down"
        >
          {{ i18n('tooltips.copy') }}
        </q-tooltip>
      </q-btn>
      <q-btn
        color="grey-7"
        dense
        icon="menu_open"
        outline
        size="sm"
        @click="emit('insert')"
      >
        <q-tooltip
          anchor="bottom middle"
          self="top middle"
          transition-hide="jump-up"
          transition-show="jump-down"
        >
          {{ i18n('tooltips.insert') }}
        </q-tooltip>
      </q-btn>
    </div>
  </div>
</template>

<style lang="scss">
.shiki {
  code {
    counter-reset: step;
    counter-increment: step 0;
  }

  code .line::before {
    content: counter(step);
    counter-increment: step;
    width: 2rem;
    margin-left: 0.5rem;
    padding-right: 0.5rem;
    display: inline-block;
    text-align: right;
    background-color: #e0e0e0;
  }

  pre {
    border-radius: 3px;
  }
}
</style>
