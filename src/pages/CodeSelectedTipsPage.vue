<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useService } from 'utils/common';
import { ServiceType } from 'shared/types/service';
import { WindowType } from 'shared/types/WindowType';

const baseName = 'pages.CodeSelectedTipsPage.';
const windowService = useService(ServiceType.WINDOW);

const { t } = useI18n();

const i18n = (relativePath: string) => {
  return t(baseName + relativePath);
};

const addToChatHandle = () => {
  console.log('addToChatHandle');
  windowService.addSelectionToChat();
  windowService.hideWindow(WindowType.SelectionTips);
};

const reviewHandle = () => {
  console.log('reviewHandle');
  windowService.reviewSelection();
  windowService.hideWindow(WindowType.SelectionTips);
};
</script>

<template>
  <div class="selection-tips-wrapper">
    <q-btn
      class="text-white"
      flat
      color="primary"
      :label="i18n('labels.addToChat')"
      @click="addToChatHandle"
    />
    <q-btn
      flat
      class="text-white"
      color="primary"
      :label="i18n('labels.review')"
      @click="reviewHandle"
    />
  </div>
</template>

<style scoped lang="scss">
.selection-tips-wrapper {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: space-around;
  background-color: hsla(0, 0%, 0%, 0.4);
}
</style>

<style lang="scss">
body.body--dark {
  background-color: transparent;
}
</style>
