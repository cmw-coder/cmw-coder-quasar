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

const currentIndex = ref(0);
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
      currentFile.content = content;
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
    currentIndex.value = 0;
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
  <q-page class="row q-pa-md">
    <q-card class="col-grow" bordered flat>
      <q-splitter :model-value="50">
        <template v-slot:before>
          <div class="column q-pa-md">
            <div class="column q-gutter-y-md">
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
            </div>
            <div class="column q-gutter-y-md">
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
                <q-scroll-area class="full-width" style="height: 633px">
                  <code-block
                    :html="codeToHtml(currentFile.content, 'c')"
                    style="max-width: 80ch"
                  />
                </q-scroll-area>
              </q-card>
            </div>
          </div>
        </template>
        <template v-slot:after>
          <div class="column q-pa-md">
            <div class="column q-gutter-y-md">
              <div class="text-h5">
                {{ i18n('labels.referenceFiles') }}
              </div>
              <div class="row q-col-gutter-x-md">
                <q-input
                  class="col-grow"
                  clearable
                  dense
                  :error="referenceFolder.error"
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
            </div>
            <div class="column q-gutter-y-sm">
              <div class="text-h5">Similar Snippets</div>
              <q-card bordered flat>
                <q-scroll-area class="full-width" style="height: 150px">
                  <q-list dense separator>
                    <q-item
                      v-for="(similarSnippet, index) in similarSnippets"
                      :key="index"
                      :active="index === currentIndex"
                      active-class="bg-blue-2"
                      clickable
                      dense
                      @click="currentIndex = index"
                    >
                      <q-item-section>
                        <q-item-label>
                          {{ similarSnippet.path.split('/').at(-1) }}
                        </q-item-label>
                        <q-item-label caption>
                          {{ similarSnippet.path }}
                        </q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        Score: {{ similarSnippet.score.toFixed(4) }}
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-scroll-area>
              </q-card>
              <q-card v-if="similarSnippets.length" bordered flat>
                <q-scroll-area
                  v-if="similarSnippets[currentIndex]"
                  class="full-width"
                  style="height: 441px"
                >
                  <code-block
                    :html="
                      codeToHtml(similarSnippets[currentIndex].content, 'c')
                    "
                    style="max-width: 80ch"
                  />
                </q-scroll-area>
              </q-card>
            </div>
          </div>
        </template>
      </q-splitter>
    </q-card>
  </q-page>
</template>

<style scoped></style>
