<script setup lang="ts">
import '@git-diff-view/vue/styles/diff-view.css';
import { DiffView } from '@git-diff-view/vue';

// import { useHighlighter } from 'stores/highlighter';

// const { codeToHtml } = useHighlighter();
const modelValue = defineModel<string>({ required: true });
</script>

<template>
  <diff-view :data="{ hunks: [modelValue] }" />
  <!--  <div class="q-pa-sm" v-html="codeToHtml(modelValue, 'diff')" />-->
</template>

<style scoped></style>
