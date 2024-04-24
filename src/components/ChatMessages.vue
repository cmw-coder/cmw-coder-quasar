<script setup lang="ts">
import AnswerItem from 'components/MessageItems/AnswerItem.vue';
import QuestionItem from 'components/MessageItems/QuestionItem.vue';
import { ChatMessage } from 'stores/chat/types';
import CopyButton from 'components/CopyButton.vue';
import { ref } from 'vue';
import { copyToClipboard, useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';

const { notify } = useQuasar();
const { t } = useI18n();

const i18n = (relativePath: string) => {
  return t('components.ChatMessages.' + relativePath);
};

interface Props {
  modelValue: ChatMessage[];
}

const props = defineProps<Props>();

const selectionX = ref(0);
const selectionY = ref(0);
const selectionText = ref('');

const copySelected = () => {
  if (selectionText.value.length) {
    copyToClipboard(selectionText.value)
      .then(() =>
        notify({
          type: 'positive',
          message: i18n('notifications.copySuccess'),
        }),
      )
      .catch(() =>
        notify({
          type: 'negative',
          message: i18n('notifications.copyFailure'),
          caption: i18n('notifications.copyManual'),
        }),
      );
  }
};

const mouseUp = (event: MouseEvent) => {
  selectionX.value = event.pageX + 10;
  selectionY.value = event.pageY - 80;
  selectionText.value = window.getSelection()?.toString() ?? '';
};
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
        text-html
        style="word-wrap: break-word"
        @mouseup="mouseUp($event)"
      >
        <div
          :class="item.error ? 'text-negative text-italic' : undefined"
          style="max-width: 80ch"
        >
          <template v-if="item.sent">
            <QuestionItem :model-value="item.content" />
          </template>
          <template v-else>
            <AnswerItem :model-value="item.content" />
            <q-spinner-dots
              v-if="item.loading"
              size="20px"
              style="margin-left: 10px"
            />
          </template>
        </div>
      </q-chat-message>
    </q-intersection>
    <copy-button
      v-show="selectionText.length > 0"
      :x="selectionX"
      :y="selectionY"
      @click="copySelected"
    />
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
