<script setup lang="ts">
import AnswerItem from 'components/MessageItems/AnswerItem.vue';
import QuestionItem from 'components/MessageItems/QuestionItem.vue';
import { ChatMessage } from 'stores/chat/types';

interface Props {
  modelValue: ChatMessage[];
}

const props = defineProps<Props>();
</script>

<template>
  <div class="column q-gutter-y-sm q-px-lg">
    <q-intersection
      v-for="(chatMessage, index) in props.modelValue"
      :key="index"
      once
      :transition="chatMessage.sent ? 'slide-left' : 'slide-right'"
      style="min-height: 48px"
    >
      <q-chat-message
        :class="chatMessage.sent ? 'self-end' : 'self-start'"
        :bg-color="chatMessage.sent ? 'primary' : 'grey-4'"
        :sent="chatMessage.sent"
        text-html
        style="word-wrap: break-word"
      >
        <div
          :class="chatMessage.error ? 'text-negative text-italic' : undefined"
          style="max-width: 80ch"
        >
          <template v-if="chatMessage.sent">
            <QuestionItem :model-value="chatMessage.content" />
          </template>
          <template v-else>
            <AnswerItem :model-value="chatMessage.content" />
            <q-spinner-dots
              v-if="chatMessage.loading"
              size="20px"
              style="margin-left: 10px"
            />
          </template>
        </div>
      </q-chat-message>
      <!--      <QuestionItem v-if="chatMessage.sent" :model-value="chatMessage" />-->
    </q-intersection>
  </div>
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
