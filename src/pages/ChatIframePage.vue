<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue';
import { timeout, useService } from 'utils/common';
import { ServiceType } from 'shared/services';
import aiAssistantIframe from 'utils/aiAssistantIframe';

const configService = useService(ServiceType.CONFIG);

const isShow = ref(true);

const refreshHandle = async () => {
  aiAssistantIframe.destroy();
  isShow.value = false;
  await timeout(500);
  isShow.value = true;
  await nextTick();
  init();
};

const init = async () => {
  const baseUrl = await configService.getConfig('baseServerUrl');
  const iframeDom = document.getElementById(
    'iframeAiAssistant',
  ) as HTMLIFrameElement;
  iframeDom.src = `${baseUrl}/h3c-ai-assistant/ui-v2/`;
  if (iframeDom.contentWindow) {
    aiAssistantIframe.init(iframeDom.contentWindow, baseUrl, refreshHandle);
  }
};

onMounted(async () => {
  init();
});
</script>

<template>
  <div class="ai-assistant">
    <iframe
      v-if="isShow"
      id="iframeAiAssistant"
      SI
      name="SI_AI_ASSISTANT"
      frameborder="0"
      sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-downloads"
    ></iframe>
  </div>
</template>

<style lang="scss" scoped>
.ai-assistant {
  height: calc(100vh - 33px);
  width: 100vw;
  position: relative;
  overflow: hidden;
  iframe {
    height: 100%;
    width: 100%;
  }
}
</style>
