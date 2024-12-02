<script setup lang="ts">
import { useHighlighter } from 'stores/highlighter';

const { codeToHtml } = useHighlighter();

defineProps<{
  cacheOffset: number;
  currentCompletion: string;
  fontSize: number;
  height: number;
}>();
</script>

<template>
  <q-card
    bordered
    style="font-family: Consolas, monospace, serif; opacity: 80%"
    :style="{
      fontSize: `${fontSize}px`,
      lineHeight: `${height - 1}px`,
    }"
  >
    <div
      ref="multiLineDom"
      v-html="
        codeToHtml(
          ' '.repeat(cacheOffset) + currentCompletion.substring(cacheOffset),
          'c',
        )
      "
      style="margin-top: -1em"
    />
  </q-card>
</template>

<style scoped></style>
