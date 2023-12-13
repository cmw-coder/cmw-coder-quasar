<script setup lang="ts">
import { useQuasar } from 'quasar';
import { getHighlighter, renderToHtml, setCDN } from 'shiki';
import { useI18n } from 'vue-i18n';
import { onMounted, ref } from 'vue';

import { Action } from 'app/src-electron/types/action';
import { SyncActionData } from 'types/action';
import { b64GbkToUtf8 } from 'utils/iconv';

const { dark } = useQuasar();
const { t } = useI18n();

const i18n = (relativePath: string) => {
  return t('pages.DashboardPage.' + relativePath);
};

const codeContent = ref('');

onMounted(async () => {
  setCDN('/node_modules/shiki/');
  const highlighter = await getHighlighter({
    themes: ['light-plus', 'dark-plus'],
    langs: ['c', 'c++'],
  });
  window.subscribeApi.action(Action.Sync, async (data: SyncActionData) => {
    const content = b64GbkToUtf8(data.content);
    codeContent.value = renderToHtml(
      highlighter.codeToThemedTokens(
        content,
        'c',
        dark.isActive ? 'dark-plus' : 'light-plus'
      ),
      {
        bg: 'transparent',
      }
    );
  });
});
</script>

<style lang="scss">
.shiki-codes {
  code {
    counter-reset: step;
    counter-increment: step 0;
  }

  code .line::before {
    content: counter(step);
    counter-increment: step;
    width: 1rem;
    margin-right: 1.5rem;
    display: inline-block;
    text-align: right;
    color: #777777;
  }

  pre {
    margin: unset;
  }
}
</style>

<template>
  <q-page class="row justify-evenly q-pa-lg">
    <q-card class="col-10" flat>
      <q-card-section class="text-h4 text-white text-center">
        {{ i18n('labels.title') }}
      </q-card-section>
      <q-card-section class="text-h6 text-grey text-center">
        {{ i18n('labels.intro') }}
      </q-card-section>
      <q-card-section>
        <q-card
          v-if="codeContent.length"
          flat
          bordered
          style="background-color: #121212"
        >
          <q-card-section>
            <div class="shiki-codes" v-html="codeContent" />
          </q-card-section>
          <div class="column q-gutter-y-sm absolute-top-right q-pa-md">
            <q-btn color="grey" dense icon="content_copy" outline size="sm">
              <q-tooltip anchor="center left" self="center right">
                {{ i18n('tooltips.copy') }}
              </q-tooltip>
            </q-btn>
            <q-btn color="grey" dense icon="content_copy" outline size="sm">
              <q-tooltip anchor="center left" self="center right">
                {{ i18n('tooltips.copy') }}
              </q-tooltip>
            </q-btn>
          </div>
        </q-card>
      </q-card-section>
    </q-card>
  </q-page>
</template>
