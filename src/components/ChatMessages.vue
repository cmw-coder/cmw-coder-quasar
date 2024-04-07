<script setup lang="ts">
import { ChatMessage } from 'stores/chat/types';
import QuestionItem from './QuestionItem.vue';
import AnswerItem from './AnswerItem.vue';

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
      <QuestionItem v-if="item.sent" :question="item" />
      <AnswerItem v-else :answer="item" />
    </q-intersection>
  </div>
</template>

<style scoped></style>

<style lang="scss">
.custom-code-render {
  padding: 10px 0;

  .tool-wrapper {
    display: flex;
    align-items: center;
    align-items: center;
    justify-content: space-between;
    background-color: var(--q-secondary);
    color: white;
    padding: 4px 0;

    .left {
      .language {
        padding: 0 10px;
      }
    }

    .right {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      flex-direction: row;
      flex-wrap: nowrap;
      .copy-button,
      .insert-button {
        margin-right: 10px;
      }
    }
  }

  .code-content {
    padding: 10px 0;
    background-color: #d3d3d3;
    overflow-x: auto;
  }
}
</style>
