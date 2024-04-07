<script setup lang="ts">
import { computed, ref, toRaw, watch, nextTick } from 'vue';
import { ChatMessage } from '../stores/chat/types';
import { markdownIt } from '../boot/extension';

interface Props {
  answer: ChatMessage;
}

const props = defineProps<Props>();

const computedMarkedContent = computed(() => {
  return markdownIt.render(props.answer.content);
});

const answerContentRef = ref(null as unknown as HTMLElement);

const addDomHandle = () => {
  const codeDoms = answerContentRef.value.querySelectorAll(
    '.custom-code-render',
  );
  for (let i = 0; i < codeDoms.length; i++) {
    const element = codeDoms[i];
    const copyButton = element.querySelector('.copy-button') as HTMLElement;
    const insertButton = element.querySelector('.insert-button') as HTMLElement;
    const codeDom = element.querySelector('.code-content>pre>code');
    let codeContent = codeDom?.textContent || '';
    copyButton.onclick = () => {
      console.log('copy', codeContent, toRaw(props.answer));
    };
    insertButton.onclick = () => {
      console.log('insert', codeContent, toRaw(props.answer));
    };
  }
};

watch(
  () => props.answer.content,
  async (value) => {
    if (value === undefined) return;
    await nextTick();
    addDomHandle();
  },
  {
    immediate: true,
  },
);
</script>

<template>
  <q-chat-message
    class="self-start"
    bg-color="grey-4"
    :sent="false"
    text-html
    style="word-wrap: break-word"
  >
    <div style="max-width: 80ch">
      <div ref="answerContentRef" v-html="computedMarkedContent"></div>
      <q-spinner-dots
        v-if="answer.loading"
        size="20px"
        style="margin-left: 10px"
      />
    </div>
  </q-chat-message>
</template>
