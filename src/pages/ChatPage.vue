<script setup lang="ts">
import { IterableReadableStream } from '@langchain/core/dist/utils/stream';
import { RemoteRunnable } from '@langchain/core/runnables/remote';
import { QScrollArea } from 'quasar';
import { storeToRefs } from 'pinia';
import { nextTick, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import ChatMessages from 'components/ChatMessages.vue';
import { useChatStore } from 'stores/chat';
import { timeout } from 'src/utils';

const baseName = 'pages.ChatPage.';

const { currentChatMessages } = storeToRefs(useChatStore());
const { t } = useI18n();

const i18n = (relativePath: string) => {
  return t(baseName + relativePath);
};

const scrollArea = ref<QScrollArea>();

watch(
  currentChatMessages,
  async () => {
    await nextTick();
    await timeout(100);
    if (scrollArea.value) {
      scrollArea.value?.setScrollPercentage('vertical', 1, 300);
    }
  },
  { deep: true },
);

onMounted(async () => {
  const remoteChain = new RemoteRunnable({
    url: 'http://10.113.36.127:9299/agent',
  });

  const stream = <
    IterableReadableStream<
      Record<
        string,
        {
          kwargs: {
            messages: {
              kwargs: {
                content: { content: string; status: 'failure' | 'success' }[];
              };
            }[];
          };
        }
      >
    >
  >await remoteChain.stream({
    input: 'placeholder',
  });

  for await (const chunk of stream) {
    const [event, data] = Object.entries(chunk)[0];
    console.log(
      event,
      data.kwargs.messages.map((message) => message.kwargs.content),
    );
  }
});
</script>

<template>
  <q-page class="flex row justify-center">
    <div class="col-grow column q-gutter-y-md">
      <q-scroll-area ref="scrollArea" class="full-height">
        <q-space :style="{ height: `${$q.screen.height / 3}px` }" />
        <div class="column q-gutter-y-xl q-my-xl text-center">
          <div class="text-h3">
            {{ i18n('labels.title') }}
          </div>
          <div class="text-h6 text-grey">
            {{ i18n('labels.intro') }}
          </div>
        </div>
        <ChatMessages v-model="currentChatMessages" />
        <q-space style="height: 48px" />
      </q-scroll-area>
    </div>
  </q-page>
</template>
