<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import GeneralCard from 'components/SettingCards/GeneralCard.vue';

const baseName = 'components.WelcomePanels.FinishPanel.';

const { t } = useI18n();

const i18n = (relativePath: string) => {
  return t(baseName + relativePath);
};

defineEmits<{
  finish: [];
}>();
</script>

<template>
  <div class="column q-gutter-y-md">
    <div class="text-center text-h3">
      {{ i18n('labels.title') }}
    </div>
    <div class="text-body1">
      {{ i18n('labels.tip') }}
    </div>
    <general-card />
    <q-btn color="primary" :label="i18n('labels.confirm')" @click="$emit('finish')" />
  </div>
</template>

<style scoped></style>
