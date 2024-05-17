<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import CodeBlock from 'components/CodeBlock.vue';
import { WindowType } from 'shared/types/WindowType';
import {
  getMostSimilarSnippetStartLine,
  IGNORE_COMMON_WORD,
  IGNORE_COMWARE_INTERNAL,
  IGNORE_RESERVED_KEYWORDS,
  SimilarSnippet,
  tokenize,
} from 'utils/developer';

const { t } = useI18n();
const { matched } = useRoute();

const i18n = (relativePath: string) => {
  return t('pages.DeveloperPage.' + relativePath);
};

const { name } = matched[matched.length - 2];

const currentFile = ref<File>();
const currentFileContent = ref('');
const currentTab = ref('');
const referenceFiles = ref<File[]>([]);
const startLine = ref(1);
const endLine = ref(1);
const similarSnippets = ref<SimilarSnippet[]>([]);

const selectCurrentFile = (file?: File) => {
  currentFile.value = file;
  if (currentFile.value) {
    const fileReader = new FileReader();
    fileReader.onload = (event) => {
      if (event.target?.result) {
        currentFileContent.value = event.target.result.toString();
        endLine.value = currentFileContent.value.split('\n').length;
      } else {
        currentFileContent.value = '';
      }
    };
    fileReader.readAsText(currentFile.value, 'gbk');
  } else {
    currentFileContent.value = '';
    similarSnippets.value = [];
  }
};

const separateTextByLine = (
  rawText: string,
  removeComments = false,
): string[] => {
  if (removeComments) {
    rawText = rawText.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
  }
  return rawText
    .split('\n')
    .filter((tabContentLine) => tabContentLine.trim().length > 0);
};

const getReferenceFileLines = () =>
  Promise.all(
    referenceFiles.value.map(
      (file): Promise<{ path: string; lines: string[] }> => {
        const reader = new FileReader();
        return new Promise((resolve) => {
          reader.onload = (event) => {
            if (event.target?.result) {
              resolve({
                path: file.name,
                lines: separateTextByLine(event.target.result.toString(), true),
              });
            } else {
              resolve({
                path: file.name,
                lines: [],
              });
            }
          };
          reader.readAsText(file, 'gbk');
        });
      },
    ),
  );

const calculate = async () => {
  if (referenceFiles.value.length) {
    const currentFileLines = currentFileContent.value.split('\n');
    const selectedCurrentFileLines = currentFileLines.splice(
      startLine.value - 1,
      endLine.value - startLine.value + 1,
    );
    const referenceFileContents = await getReferenceFileLines();
    referenceFileContents.push({
      path: currentFile.value?.name ?? 'currentFile',
      lines: separateTextByLine(currentFileLines.join('\n'), true),
    });

    const mostSimilarSnippets = Array<SimilarSnippet>();

    referenceFileContents.forEach(({ path, lines }) => {
      const { score, startLine } = getMostSimilarSnippetStartLine(
        lines.map((line) =>
          tokenize(line, [
            IGNORE_RESERVED_KEYWORDS,
            IGNORE_COMMON_WORD,
            IGNORE_COMWARE_INTERNAL,
          ]),
        ),
        tokenize(selectedCurrentFileLines.join('\n'), [
          IGNORE_RESERVED_KEYWORDS,
          IGNORE_COMMON_WORD,
          IGNORE_COMWARE_INTERNAL,
        ]),
        separateTextByLine(selectedCurrentFileLines.join('\n'), true).length,
      );
      const currentMostSimilarSnippet: SimilarSnippet = {
        path,
        score: score,
        line: startLine + 1,
        content: lines
          .slice(
            startLine,
            startLine +
              separateTextByLine(selectedCurrentFileLines.join('\n'), true)
                .length,
          )
          .join('\n'),
      };
      mostSimilarSnippets.push(currentMostSimilarSnippet);
    });

    console.log(mostSimilarSnippets);

    similarSnippets.value = mostSimilarSnippets
      .filter((mostSimilarSnippet) => mostSimilarSnippet.score > 0)
      .sort((first, second) => first.score - second.score)
      .reverse();
    currentTab.value = similarSnippets.value[0].path;
  } else {
    similarSnippets.value = [];
  }
};

onMounted(() => {
  if (name) {
    window.controlApi.devTools(<WindowType>name);
    window.controlApi.resize({ width: 1600, height: 900 }, <WindowType>name);
  }
});

onBeforeUnmount(() => {
  if (name) {
    window.controlApi.resize({}, <WindowType>name);
  }
});
</script>

<template>
  <q-page class="row justify-start q-col-gutter-x-md q-pa-md">
    <div class="column col-6 q-gutter-y-md">
      <q-card bordered flat>
        <q-card-section class="q-gutter-y-md">
          <div class="text-h5">
            {{ i18n('labels.currentFile') }}
          </div>
          <q-file
            accept=".c, .cc, .cpp, .h, .hpp"
            clearable
            label="Click to pick file"
            outlined
            :model-value="currentFile"
            @clear="selectCurrentFile()"
            @update:model-value="selectCurrentFile"
          />
        </q-card-section>
        <q-card-section v-if="currentFileContent" class="q-gutter-y-md">
          <div class="row items-center q-col-gutter-x-md">
            <div class="text-h5">Window Size</div>
            <q-input
              class="col-grow"
              dense
              label="Start Line"
              outlined
              type="number"
              v-model="startLine"
            />
            <q-input
              class="col-grow"
              dense
              label="End Line"
              outlined
              type="number"
              v-model="endLine"
            />
          </div>
          <q-scroll-area class="full-width" style="height: 560px">
            <code-block :html="currentFileContent" />
          </q-scroll-area>
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
            <q-file
              class="col-grow"
              accept=".c, .cc, .cpp, .h, .hpp"
              clearable
              label="Click to pick files"
              multiple
              outlined
              use-chips
              v-model="referenceFiles"
            >
              <template v-slot:after>
                <q-btn
                  color="primary"
                  :disable="referenceFiles.length === 0 || !currentFile"
                  label="Calculate"
                  no-caps
                  size="lg"
                  unelevated
                  @click="calculate"
                />
              </template>
            </q-file>
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
                :label="similarSnippet.path"
                :name="similarSnippet.path"
              />
            </q-tabs>
          </q-card>
          <q-card bordered flat>
            <q-tab-panels v-model="currentTab">
              <q-tab-panel
                v-for="(similarSnippet, index) in similarSnippets"
                :key="index"
                class="q-gutter-y-md"
                :name="similarSnippet.path"
              >
                <div class="row justify-between">
                  <div>Start Line: {{ similarSnippet.line }}</div>
                  <div>Score: {{ similarSnippet.score }}</div>
                </div>
                <q-scroll-area class="full-width" style="height: 443px">
                  <code-block :html="similarSnippet.content" />
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
