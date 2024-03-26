<script setup lang="ts">
import { ChatMessage } from 'stores/chat/types';

interface Props {
  modelValue: ChatMessage[];
}

const props = defineProps<Props>();
</script>

<template>
  <div class="column q-gutter-y-sm q-px-lg">
    <q-intersection
      v-for="(item, index) in props.modelValue"
      :key="index"
      once
      :transition="item.sent ? 'slide-left' : 'slide-right'"
      style="min-height: 48px"
    >
      <q-chat-message
        :class="item.sent ? 'self-end' : 'self-start'"
        :bg-color="item.sent ? 'primary' : 'grey-4'"
        :sent="item.sent"
        :text-color="item.sent ? 'white' : undefined"
        text-html
        style="word-wrap: break-word"
      >
        <div
          :class="item.error ? 'text-negative text-italic' : undefined"
          style="max-width: 80ch"
        >
          <div v-html="item.content" />
          <q-spinner-dots
            v-if="item.loading"
            size="20px"
            style="margin-left: 10px"
          />
        </div>
      </q-chat-message>
    </q-intersection>
  </div>
</template>

<style scoped></style>
