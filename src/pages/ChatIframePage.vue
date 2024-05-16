<script setup lang="ts">
import { nextTick, onMounted } from 'vue';
import { useService } from 'utils/common';
import { ServiceType } from 'shared/types/service';
import aiAssistantIframe from 'utils/aiAssistantIframe';

const configService = useService(ServiceType.CONFIG);

onMounted(async () => {
  const baseUrl = await configService.getConfig('baseServerUrl');
  await nextTick();
  const iframeDom = document.getElementById(
    'iframeAiAssistant',
  ) as HTMLIFrameElement;
  iframeDom.src = `${baseUrl}/h3c-ai-assistant/ui-v2/`;
  if (iframeDom.contentWindow) {
    aiAssistantIframe.init(iframeDom.contentWindow, baseUrl);
  }
});
</script>

<template>
  <div class="ai-assistant">
    <iframe
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
