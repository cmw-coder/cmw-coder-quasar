<script lang="ts" setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { useHighlighter } from 'stores/highlighter';

interface ChangedFile {
  path: string;
  status: 'added' | 'deleted' | 'modified';
  additions: number;
  deletions: number;
  diff: string;
}

const { codeToHtml } = useHighlighter();
const { t } = useI18n();

const baseName = 'pages.CommitPage.';

const i18n = (relativePath: string) => {
  return t(baseName + relativePath);
};

const changedFileList = ref<ChangedFile[]>([
  {
    path: 'src/router/constants.ts',
    status: 'modified',
    additions: 6,
    deletions: 0,
    diff: `Index: src/router/constants.ts
IDEA additional info:
Subsystem: com.intellij.openapi.diff.impl.patch.CharsetEP
<+>UTF-8
===================================================================
diff --git a/src/router/constants.ts b/src/router/constants.ts
--- a/src/router/constants.ts\t(revision 4f8101738bf41956ea9bfe3f963d2de73dc98a6e)
+++ b/src/router/constants.ts\t(date 1712562421075)
@@ -61,6 +61,12 @@
           default: () => import('pages/CompletionImmersivePage.vue'),
         },
       },
+      {
+        path: 'quake',
+        components: {
+          default: () => import('pages/QuakePage.vue'),
+        },
+      }
     ],
   },
   {
`,
  },
]);

const commitMessage = ref('');
const selectedIndex = ref(0);
const shadowText = ref('');
const splitPercentage = ref(50);

const generateCommitMessage = () => {
  shadowText.value = `: add CommitPage.vue file
  fix: fix data store merge error
  docs: update docs`;
};
</script>

<template>
  <q-page class="column justify-evenly q-pa-xl">
    <q-card-section class="text-h3 text-center">
      {{ i18n('labels.title') }}
    </q-card-section>
    <q-card-section class="column q-gutter-y-md">
      <div class="text-bold text-grey text-h6">
        {{ i18n('labels.changes') }}
      </div>
      <q-card>
        <q-splitter horizontal v-model="splitPercentage" style="height: 500px">
          <template v-slot:before>
            <q-scroll-area class="full-height full-width">
              <q-list separator>
                <q-item
                  v-for="(item, index) in changedFileList"
                  :key="index"
                  :active="selectedIndex === index"
                  active-class="bg-grey-4 text-black"
                  clickable
                  @click="selectedIndex = index"
                >
                  <q-item-section avatar>
                    <q-icon
                      v-if="item.status === 'added'"
                      name="mdi-file-document-plus"
                      color="positive"
                      size="2rem"
                    />
                    <q-icon
                      v-if="item.status === 'deleted'"
                      name="mdi-file-document-minus"
                      color="negative"
                      size="2rem"
                    />
                    <q-icon
                      v-if="item.status === 'modified'"
                      name="mdi-file-document-edit"
                      color="warn"
                      size="2rem"
                    />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>
                      {{ item.path }}
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side top>
                    <q-item-label caption>
                      {{ item.additions }}+ / {{ item.deletions }}-
                    </q-item-label>
                    <div class="row">
                      <q-icon
                        v-for="sequence in 5"
                        :key="sequence"
                        name="mdi-square"
                        :color="
                          sequence <=
                          (item.additions / (item.additions + item.deletions)) *
                            5
                            ? 'positive'
                            : sequence <=
                                (item.deletions /
                                  (item.additions + item.deletions)) *
                                  5
                              ? 'negative'
                              : 'grey'
                        "
                      />
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-scroll-area>
          </template>
          <template v-slot:after>
            <q-scroll-area class="full-height full-width">
              <div
                class="q-pa-sm"
                v-html="codeToHtml(changedFileList[selectedIndex].diff, 'diff')"
              />
            </q-scroll-area>
          </template>
        </q-splitter>
      </q-card>
    </q-card-section>
    <q-card-section class="column q-gutter-x-md">
      <div class="text-bold text-grey text-h6">
        {{ i18n('labels.message') }}
      </div>
      <div class="commit-message-input">
        <q-btn
          class="generate-btn"
          color="grey-7"
          dense
          icon="mdi-message-fast-outline"
          outline
          size="sm"
          @click="() => generateCommitMessage()"
        >
          <q-tooltip
            anchor="bottom middle"
            self="top middle"
            transition-hide="jump-up"
            transition-show="jump-down"
          >
            {{ i18n('tooltips.generate') }}
          </q-tooltip>
        </q-btn>
        <q-input
          clearable
          dense
          :maxlength="400"
          outlined
          :shadow-text="shadowText"
          type="textarea"
          v-model="commitMessage"
        />
      </div>
    </q-card-section>
    <q-card-section class="row q-gutter-x-md">
      <q-btn
        class="col-grow"
        color="primary"
        :label="i18n('labels.submit')"
        @click="() => {}"
      />
    </q-card-section>
  </q-page>
</template>

<style lang="scss" scoped>
.commit-message-input {
  position: relative;

  .generate-btn {
    position: absolute;
    right: 10px;
    top: 10px;
    z-index: 100;
  }
}
</style>
