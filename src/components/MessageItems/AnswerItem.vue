<script setup lang="ts">
import { copyToClipboard, useQuasar } from 'quasar';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { markdownIt } from 'boot/extension';
import CodeBlock from 'components/CodeBlock.vue';
import { ChatInsertActionMessage } from 'shared/types/ActionMessage';

type MarkdownComponent =
  | {
      type: 'text';
      content: string;
    }
  | {
      type: 'code';
      content: string;
      index: number;
    };

interface Props {
  modelValue: string;
}

const props = defineProps<Props>();

const { notify } = useQuasar();
const { t } = useI18n();

const i18n = (relativePath: string) => {
  return t('components.MessageItems.AnswerItem.' + relativePath);
};

const markdownComponents = computed(() => {
  const result: MarkdownComponent[] = [];
  const html = markdownIt.render(props.modelValue);
  let beginIndex = html.indexOf('<pre class="shiki');
  let codeIndex = 0;
  let endIndex = 0;
  while (beginIndex !== -1) {
    result.push({
      type: 'text',
      content: html.substring(endIndex, beginIndex),
    });
    endIndex = html.indexOf('</pre>', beginIndex) + 6;
    result.push({
      type: 'code',
      content: html.substring(beginIndex, endIndex),
      index: codeIndex++,
    });
    beginIndex = html.indexOf('<pre class="shiki', endIndex);
  }
  result.push({
    type: 'text',
    content: html.substring(endIndex),
  });
  return result;
});

const getMarkdownCodeContent = (index: number) =>
  [...props.modelValue.matchAll(/```\S*?\n([\s\S]+?)\n```/gm)][index]?.[1];

const onCopy = (index: number) => {
  const content = getMarkdownCodeContent(index);
  if (content) {
    copyToClipboard(content)
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

const onInsert = (index: number) => {
  const content = getMarkdownCodeContent(index);
  console.log('onInsert', content);
  window.actionApi.send(new ChatInsertActionMessage(content));
};
</script>

<template>
  <template v-for="item in markdownComponents" :key="item">
    <CodeBlock
      v-if="item.type === 'code'"
      class="q-ma-sm bg-grey-5"
      :html="item.content"
      @copy="onCopy(item.index)"
      @insert="onInsert(item.index)"
    />
    <div v-else v-html="item.content" />
  </template>
</template>
