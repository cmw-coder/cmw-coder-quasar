import { defineStore } from 'pinia';
import { ref } from 'vue';
import { ChatMessage } from 'stores/chat/types';
import { api_questionStream } from 'app/src/request/api';
import { useService } from 'utils/common';
import { ServiceType } from 'shared/services';

export const useChatStore = defineStore('chat', () => {
  const currentChatMessages = ref<ChatMessage[]>([]);

  const askQuestion = async (content: string) => {
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
      const configService = useService(ServiceType.CONFIG);
      const { activeTemplate, activeModel } = await configService.getConfigs();
      await api_questionStream(
        {
          question: content,
          templateName: 'Chat',
          productLine: activeTemplate,
          profileModel: activeModel,
          historyList,
        },
        (event) => {
          const responseText = event.event.target.responseText as string;
          currentResponse.content = responseText
            .split('data:')
            .filter((item) => item.trim() !== '')
            .map((item) => JSON.parse(item.trim()).message)
            .join('');
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
