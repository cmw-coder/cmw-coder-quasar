<script setup lang="ts">
import { useHighlighter } from 'stores/highlighter';
import { useSettingsStore } from 'stores/settings';

const { initialize } = useHighlighter();
const { applyDarkMode } = useSettingsStore();

initialize().then();
applyDarkMode();
</script>

<template>
  <router-view />
</template>
