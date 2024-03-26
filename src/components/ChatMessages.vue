<script setup lang="ts">
import { ChatMessage } from 'stores/chat';

interface Props {
  modelValue: ChatMessage[];
}

const props = defineProps<Props>();
</script>

<template>
  <div class="column q-gutter-y-sm">
    <div
      v-for="(item, index) in props.modelValue"
      :key="index"
      class="row"
      :class="item.sent ? 'justify-end' : 'justify-start'"
    >
      <q-chat-message
        :bg-color="item.sent ? 'primary' : 'grey-4'"
        :sent="item.sent"
        :text-color="item.sent ? 'white' : undefined"
        text-html
        style="max-width: 75%; word-wrap: break-word"
      >
        <div :class="item.error ? 'text-negative text-italic' : undefined">
          <div v-html="item.content" />
          <q-spinner-dots
            v-if="item.loading"
            size="20px"
            style="margin-left: 10px"
          />
        </div>
      </q-chat-message>
    </div>
  </div>
</template>

<style scoped></style>
