import { defineStore } from 'pinia';
import { ref } from 'vue';

import { question } from 'boot/axios';
import { markdownIt } from 'boot/extension';

export interface ChatMessage {
  content: string;
  error: boolean;
  loading: boolean;
  sent: boolean;
}

export const useChatStore = defineStore('chat', () => {
  const currentChatMessages = ref<ChatMessage[]>([]);

  const askQuestion = async (content: string) => {
    const newLength = currentChatMessages.value.push(
      {
        content,
        error: false,
        loading: false,
        sent: true,
      },
      {
        content: '',
        error: false,
        loading: true,
        sent: false,
      },
    );
    const currentResponse = currentChatMessages.value[newLength - 1];
    try {
      await question(
        'http://rdee.h3c.com/kong/RdTestAiService',
        content,
        [],
        '2H5b0MdPebH24YXv9JTO0j1FYQ5bfiPz',
        (content) => {
          currentResponse.content = markdownIt.render(
            content
              .split('data:')
              .filter((item) => item.trim() !== '')
              .map((item) => JSON.parse(item.trim()).message)
              .join(''),
          );
        },
      );
    } catch {
      currentResponse.content = 'Failed to get response';
      currentResponse.error = true;
    }
    currentResponse.loading = false;
  };

  const newTopic = () => {
    currentChatMessages.value = [];
  };

  return {
    currentChatMessages,
    askQuestion,
    newTopic,
  };
});
