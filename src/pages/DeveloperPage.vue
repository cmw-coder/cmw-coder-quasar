<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import CodeBlock from 'components/CodeBlock.vue';
import { NEW_LINE_REGEX } from 'shared/constants/common';
import { SimilarSnippet } from 'shared/types/common';
import { ServiceType } from 'shared/types/service';
import { WindowType } from 'shared/types/WindowType';
import { useHighlighter } from 'stores/highlighter';
import { useService } from 'utils/common';

const { codeToHtml } = useHighlighter();
const { t } = useI18n();

const i18n = (relativePath: string) => {
  return t('pages.DeveloperPage.' + relativePath);
};

const websocketService = useService(ServiceType.WEBSOCKET);
const windowService = useService(ServiceType.WINDOW);

const currentTab = ref('');
const caret = reactive({
  character: 0,
  line: 0,
});
const currentFile = reactive({
  content: '',
  error: false,
  loading: false,
  path: '',
});
const referenceFolder = reactive({
  error: false,
  loading: false,
  path: '',
});
const similarSnippets = ref<SimilarSnippet[]>([]);

const checkReferenceFolder = async () => {
  if (referenceFolder.path) {
    referenceFolder.loading = true;
    referenceFolder.error = !(await websocketService.checkFolderExist(
      referenceFolder.path,
    ));
    referenceFolder.loading = false;
  }
};

const getCurrentFileContent = async () => {
  if (currentFile.path) {
    currentFile.loading = true;
    const content = await websocketService.getFileContent(currentFile.path);
    if (content) {
      currentFile.content = codeToHtml(content, 'c');
      currentFile.error = false;
    } else {
      currentFile.error = true;
    }
    currentFile.loading = false;
  }
};

const calculate = async () => {
  if (currentFile.path && referenceFolder.path) {
    const contentLines = currentFile.content.split(NEW_LINE_REGEX);
    const prefixLines = contentLines.slice(
      caret.line > 100 ? caret.line - 100 : 0,
      caret.line,
    );
    prefixLines.at(-1)?.substring(0, caret.character);
    const suffixLines = contentLines.slice(caret.line, caret.line + 30);
    suffixLines.at(0)?.substring(caret.character);
    console.log({
      prefix: prefixLines.join('\n'),
      suffix: suffixLines.join('\n'),
    });

    similarSnippets.value = await websocketService.getSimilarSnippets(
      caret.character,
      referenceFolder.path,
      caret.line,
      currentFile.path,
      prefixLines.join('\n'),
      suffixLines.join('\n'),
    );
    currentTab.value = similarSnippets.value[0].path;
  } else {
    similarSnippets.value = [];
  }
};

onMounted(() => {
  windowService.setWindowSize({ width: 1600, height: 900 }, WindowType.Main);
  windowService.openDevTools(WindowType.Main);
});

onBeforeUnmount(() => {
  windowService.defaultWindowSize(WindowType.Main);
});
</script>

<template>
  <q-page class="row justify-start q-col-gutter-x-md q-pa-md">
    <div class="column col-6 q-gutter-y-md">
      <q-card bordered flat>
        <q-card-section class="q-gutter-y-md">
          <div class="row items-baseline q-col-gutter-x-md">
            <div class="text-h5">
              {{ i18n('labels.currentFile') }}
            </div>
            <q-input
              class="col-grow"
              clearable
              dense
              :error="currentFile.error"
              label="Input current file path"
              :loading="currentFile.loading"
              outlined
              v-model="currentFile.path"
              @blur="getCurrentFileContent"
              @keyup.enter.stop="getCurrentFileContent"
            />
          </div>
        </q-card-section>
        <q-card-section class="q-gutter-y-md">
          <div class="row items-center q-col-gutter-x-md">
            <div class="text-h5">Caret Position</div>
            <q-input
              class="col-grow"
              dense
              label="Cursor line"
              outlined
              type="number"
              v-model="caret.line"
            />
            <q-input
              class="col-grow"
              dense
              label="Cursor character"
              outlined
              type="number"
              v-model="caret.character"
            />
          </div>
          <q-card bordered flat>
            <q-scroll-area class="full-width" style="height: 600px">
              <code-block :html="currentFile.content" style="max-width: 80ch" />
            </q-scroll-area>
          </q-card>
        </q-card-section>
      </q-card>
    </div>
    <div class="column col-6 q-gutter-y-md">
      <q-card bordered flat>
        <q-card-section class="q-gutter-y-md">
          <div class="text-h5">
            {{ i18n('labels.referenceFiles') }}
          </div>
          <div class="row q-col-gutter-x-md">
            <q-input
              class="col-grow"
              clearable
              :error="referenceFolder.error"
              label="Input current file path"
              :loading="referenceFolder.loading"
              outlined
              v-model="referenceFolder.path"
              @blur="checkReferenceFolder"
              @keyup.enter.stop="checkReferenceFolder"
            >
              <template v-slot:after>
                <q-btn
                  class="full-height"
                  color="primary"
                  :disable="
                    !currentFile.path ||
                    currentFile.error ||
                    currentFile.loading ||
                    !referenceFolder.path ||
                    referenceFolder.error ||
                    referenceFolder.loading
                  "
                  icon="mdi-file-find"
                  outline
                  @click="calculate"
                />
              </template>
            </q-input>
          </div>
        </q-card-section>
        <q-card-section v-if="similarSnippets.length" class="q-gutter-y-md">
          <div class="text-h5">Similar Snippets</div>
          <q-card bordered flat>
            <q-tabs
              class="text-grey"
              active-color="primary"
              align="justify"
              dense
              indicator-color="primary"
              narrow-indicator
              no-caps
              v-model="currentTab"
              style="max-width: 733px"
            >
              <q-tab
                v-for="(similarSnippet, index) in similarSnippets"
                :key="index"
                :label="similarSnippet.path.split('/').at(-1)"
                :name="similarSnippet.path"
              >
                <q-tooltip>
                  {{ similarSnippet.path }}
                </q-tooltip>
              </q-tab>
            </q-tabs>
          </q-card>
          <q-card bordered flat>
            <q-tab-panels v-model="currentTab">
              <q-tab-panel
                v-for="(similarSnippet, index) in similarSnippets"
                :key="index"
                class="q-gutter-y-xs"
                :name="similarSnippet.path"
              >
                <div>Score: {{ similarSnippet.score }}</div>
                <q-separator />
                <q-scroll-area class="full-width" style="height: 420px">
                  <code-block
                    :html="codeToHtml(similarSnippet.content, 'c')"
                    style="max-width: 80ch"
                  />
                </q-scroll-area>
              </q-tab-panel>
            </q-tab-panels>
          </q-card>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<style scoped></style>
