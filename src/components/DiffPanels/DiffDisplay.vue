<script setup lang="ts">
import '@git-diff-view/vue/styles/diff-view.css';
import { DiffView } from '@git-diff-view/vue';

const modelValue = defineModel<string>({ required: true });
</script>

<template>
  <diff-view :data="{ hunks: [modelValue] }" :diffViewFontSize="10" />
</template>

<style scoped></style>
