<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { useChatStore } from 'stores/chat';
import { ActionApi } from 'types/ActionApi';
import {
  ActionType,
  ConfigStoreLoadActionMessage,
} from 'shared/types/ActionMessage';
import { ApiStyle } from 'shared/types/model';

const baseName = 'layouts.footers.QuestionFooter.';

const { askQuestion, newTopic } = useChatStore();
const { t } = useI18n();

const i18n = (relativePath: string) => {
  return t(baseName + relativePath);
};

const accessToken = ref<string>();
const currentApiStyle = ref<ApiStyle>();
const endpoint = ref<string>();
const questionText = ref<string>();
const thinking = ref(false);

const sendQuestion = async () => {
  if (
    currentApiStyle.value &&
    endpoint.value &&
    questionText.value &&
    questionText.value.trim().length
  ) {
    thinking.value = true;
    const currentQuestion = questionText.value.trim();
    questionText.value = '';
    await askQuestion(
      currentApiStyle.value,
      endpoint.value,
      currentQuestion,
      accessToken.value,
    );
    thinking.value = false;
  }
};

const startNewTopic = () => {
  questionText.value = '';
  newTopic();
};

const actionApi = new ActionApi(baseName);
onMounted(async () => {
  actionApi.register(
    ActionType.ConfigStoreLoad,
    ({ apiStyle, config, data }) => {
      currentApiStyle.value = apiStyle;
      if (apiStyle == ApiStyle.Linseer) {
        accessToken.value = data.tokens.access;
      }
      endpoint.value = config.endpoints.aiService;
    },
  );
  window.actionApi.send(new ConfigStoreLoadActionMessage());
});
onBeforeUnmount(() => {
  actionApi.unregister();
});
</script>

<template>
  <q-footer class="bg-transparent q-pa-md" bordered>
    <q-input
      class="col-grow"
      autofocus
      autogrow
      outlined
      placeholder="Ask any question..."
      v-model="questionText"
      @keydown.enter.prevent="sendQuestion"
    >
      <template v-slot:before>
        <q-btn
          color="primary"
          icon="mdi-message-plus"
          round
          @click="startNewTopic"
        >
          <q-tooltip>
            {{ i18n('tooltips.newTopic') }}
          </q-tooltip>
        </q-btn>
      </template>
      <template v-slot:append>
        <q-btn
          :color="!questionText || thinking ? undefined : 'primary'"
          :disable="!questionText || thinking"
          flat
          icon="mdi-send"
          round
          @click="sendQuestion"
        />
      </template>
    </q-input>
  </q-footer>
</template>

<style scoped></style>
