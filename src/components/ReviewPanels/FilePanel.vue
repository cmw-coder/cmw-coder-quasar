<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const baseName = 'components.ReviewPanels.FilePanel.';
const i18n = (relativePath: string, data?: Record<string, unknown>) => {
  return data ? t(baseName + relativePath, data) : t(baseName + relativePath);
};
</script>

<template>
  <q-card> </q-card>
</template>

<style scoped></style>
