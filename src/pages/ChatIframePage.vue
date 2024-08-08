<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { timeout, useService } from 'utils/common';
import aiAssistantIframe from 'utils/aiAssistantIframe';
import { ServiceType } from 'shared/types/service';
import { ActionApi } from 'types/ActionApi';
import { ActionType } from 'shared/types/ActionMessage';
import { MainWindowPageType } from 'shared/types/MainWindowPageType';

const baseName = 'pages.ChatIframe';
const actionApi = new ActionApi(baseName);
const configService = useService(ServiceType.CONFIG);
const windowService = useService(ServiceType.WINDOW);

const isShow = ref(true);

const refreshHandle = async () => {
  aiAssistantIframe.destroy();
  isShow.value = false;
  await timeout(500);
  isShow.value = true;
  await nextTick();
  await init();
};

const init = async () => {
  const baseUrl = (await configService.getConfig('baseServerUrl')) ?? '';
  const iframeDom = document.getElementById(
    'iframeAiAssistant',
  ) as HTMLIFrameElement;
  iframeDom.src = `${baseUrl}/h3c-ai-assistant/ui-v2/`;
  if (iframeDom.contentWindow) {
    aiAssistantIframe.init(iframeDom.contentWindow, baseUrl, refreshHandle);
  }
};

onMounted(async () => {
  await init();
  actionApi.register(ActionType.ToggleDarkMode, () => {
    refreshHandle();
  });
  actionApi.register(ActionType.MainWindowCheckPageReady, (type) => {
    if (type === MainWindowPageType.Chat) {
      windowService.setMainWindowPageReady(MainWindowPageType.Chat);
    }
  });
  actionApi.register(ActionType.AddSelectionToChat, (selection) => {
    console.log('addSelectionToChat', selection);
    aiAssistantIframe.customQuestion(selection);
  });
  setTimeout(() => {
    windowService.setMainWindowPageReady(MainWindowPageType.Chat);
  }, 1000);
});

onBeforeUnmount(() => {
  actionApi.unregister();
});
</script>

<template>
  <q-page class="full-height full-width overflow-hidden">
    <iframe
      v-if="isShow"
      class="full-height full-width"
      aria-description="AI Assistant for Source Insight"
      id="iframeAiAssistant"
      name="SI_AI_ASSISTANT"
      sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-downloads"
      style="border: none"
    />
  </q-page>
</template>
