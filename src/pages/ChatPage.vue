<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import ChatMessages from 'components/ChatMessages.vue';
import { useChatStore } from 'stores/chat';
import { QScrollArea } from 'quasar';

const baseName = 'pages.ChatPage.';

const { currentChatMessages } = storeToRefs(useChatStore());
const { t } = useI18n();

const i18n = (relativePath: string) => {
  return t(baseName + relativePath);
};

const scrollArea = ref<QScrollArea>();

watch(
  currentChatMessages,
  () =>
    setTimeout(() => {
      if (scrollArea.value) {
        scrollArea.value?.setScrollPercentage('vertical', 1, 300);
      }
    }, 100),
  { deep: true },
);
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

<style lang="scss">
.shiki {
  code {
    counter-reset: step;
    counter-increment: step 0;
  }

  code .line::before {
    content: counter(step);
    counter-increment: step;
    width: 2rem;
    margin-left: 0.5rem;
    padding-right: 0.5rem;
    display: inline-block;
    text-align: right;
    background-color: #bdbdbd;
  }

  pre {
    border-radius: 3px;
  }
}
</style>
