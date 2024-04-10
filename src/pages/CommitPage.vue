<script lang="ts" setup>
import { useQuasar } from 'quasar';
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import {
  ActionType,
  ConfigStoreLoadActionMessage,
} from 'app/src-electron/shared/types/ActionMessage';
import { ApiStyle } from 'app/src-electron/shared/types/model';
import { ChangedFile } from 'app/src-electron/shared/types/SvnType';
import { chatWithLinseer } from 'boot/axios';
import { useHighlighter } from 'stores/highlighter';
import { ActionApi } from 'types/ActionApi';
import { generateCommitPrompt } from 'utils/commitPrompt';

const { codeToHtml } = useHighlighter();
const { t } = useI18n();
const { notify } = useQuasar();

const baseName = 'pages.CommitPage.';

const actionApi = new ActionApi(baseName);

const i18n = (relativePath: string) => {
  return t(baseName + relativePath);
};

const changedFileList = ref<ChangedFile[]>([]);

const commitMessage = ref('');
const selectedIndex = ref(0);
const shadowText = ref('');
const splitPercentage = ref(40);

const accessToken = ref<string>();
const endpoint = ref<string>();

const generateLoading = ref(false);

const generateCommitMessage = async () => {
  const commitPrompt = generateCommitPrompt(changedFileList.value);
  console.log('commitPrompt', commitPrompt);
  try {
    generateLoading.value = true;
    const { data } = await chatWithLinseer(
      endpoint.value || '',
      commitPrompt,
      [],
      accessToken.value || '',
    );
    const result = data[0]?.code;
    commitMessage.value = result;
  } finally {
    generateLoading.value = false;
  }
};

const getDiffData = () => {
  window.actionApi.send({
    type: ActionType.SvnDiffRequest,
    data: undefined,
  });
};

const submitCommitMessage = () => {
  window.actionApi.send({
    type: ActionType.SvnCommitRequest,
    data: commitMessage.value,
  });
};

onMounted(() => {
  getDiffData();
  actionApi.register(ActionType.SvnDiffResponse, (data) => {
    console.log('SvnDiffResponse', data);
    changedFileList.value = data;
  });
  actionApi.register(
    ActionType.ConfigStoreLoad,
    ({ apiStyle, config, data }) => {
      if (apiStyle == ApiStyle.Linseer) {
        accessToken.value = data.tokens.access;
      }
      endpoint.value = config.endpoints.aiService;
    },
  );
  actionApi.register(ActionType.SvnCommitSuccess, () => {
    notify({
      type: 'positive',
      message: i18n('notifications.commitSuccess'),
    });
    commitMessage.value = '';
    getDiffData();
  });
  window.actionApi.send(new ConfigStoreLoadActionMessage());
});
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
                      v-if="item.type === 'added'"
                      name="mdi-file-document-plus"
                      color="positive"
                      size="2rem"
                    />
                    <q-icon
                      v-if="item.type === 'missing'"
                      name="mdi-file-document-minus"
                      color="negative"
                      size="2rem"
                    />
                    <q-icon
                      v-if="item.type === 'modified'"
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
                v-if="changedFileList[selectedIndex]"
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
          :loading="generateLoading"
          :disabled="changedFileList.length === 0"
          @click="() => generateCommitMessage()"
        >
          <q-tooltip
            anchor="bottom middle"
            self="top middle"
            transition-hide="jump-up"
            transition-show="jump-down"
          >
            {{
              generateLoading
                ? i18n('tooltips.generating')
                : i18n('tooltips.generate')
            }}
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
          :disabled="changedFileList.length === 0"
        />
      </div>
    </q-card-section>
    <q-card-section class="row q-gutter-x-md">
      <q-btn
        class="col-grow"
        color="primary"
        :label="i18n('labels.submit')"
        :disabled="!commitMessage"
        @click="() => submitCommitMessage()"
      />
    </q-card-section>
  </q-page>
</template>

<style lang="scss" scoped>
.commit-message-input {
  position: relative;

  .generate-btn {
    position: absolute;
    right: 0px;
    top: -30px;
    z-index: 100;
  }
}
</style>
