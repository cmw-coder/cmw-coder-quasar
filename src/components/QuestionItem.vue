<script setup lang="ts">
import { ChatMessage } from '../stores/chat/types';

interface Props {
  question: ChatMessage;
}

const props = defineProps<Props>();
</script>

<template>
  <q-chat-message
    class="self-end"
    bg-color="primary"
    sent
    text-color="white"
    text-html
    style="word-wrap: break-word"
  >
    <div style="max-width: 80ch">
      {{ props.question.content }}
    </div>
  </q-chat-message>
</template>
