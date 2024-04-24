import { defineStore } from 'pinia';
import { ref } from 'vue';

import { chatWithDeepSeek, chatWithLinseer } from 'boot/axios';
import { ChatMessage } from 'stores/chat/types';
import { runtimeConfig } from 'shared/config';
import { ApiStyle } from 'shared/types/model';

export const useChatStore = defineStore('chat', () => {
  const currentChatMessages = ref<ChatMessage[]>([]);

  const askQuestion = async (
    endPoint: string,
    content: string,
    accessToken?: string,
  ) => {
    const historyList = currentChatMessages.value.map<{
      role: 'assistant' | 'user';
      content: string;
    }>((item) => ({
      role: item.sent ? 'user' : 'assistant',
      content: item.content,
    }));
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
      if (runtimeConfig.apiStyle == ApiStyle.Linseer) {
        if (accessToken) {
          await chatWithLinseer(
            endPoint,
            content,
            historyList,
            accessToken,
            (content) => {
              currentResponse.content = content
                .split('data:')
                .filter((item) => item.trim() !== '')
                .map((item) => JSON.parse(item.trim()).message)
                .join('');
            },
          );
        } else {
          currentResponse.content = 'Invalid access token';
          currentResponse.error = true;
        }
      } else {
        const { data } = await chatWithDeepSeek(
          'http://10.113.36.127:9204',
          content,
          historyList,
          (content) => console.log(content),
        );
        if (data.choices[0]?.message?.content) {
          currentResponse.content = data.choices[0]?.message?.content;
        } else {
          currentResponse.content = 'Failed to get response';
          currentResponse.error = true;
        }
      }
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
