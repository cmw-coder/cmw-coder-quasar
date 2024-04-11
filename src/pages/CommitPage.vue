<script lang="ts" setup>
import { useQuasar } from 'quasar';
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import {
  ActionType,
  ConfigStoreLoadActionMessage,
} from 'app/src-electron/shared/types/ActionMessage';
import { ApiStyle } from 'app/src-electron/shared/types/model';
import { ChangedFile } from 'shared/types/svn';
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

const accessToken = ref<string>();
const changedFileList = ref<ChangedFile[]>();
const commitMessage = ref('');
const endpoint = ref<string>();
const loadingCommit = ref(false);
const loadingDiff = ref(false);
const loadingGenerate = ref(false);
const selectedIndex = ref(0);
const shadowText = ref('');
const splitPercentage = ref(40);

const generateCommitMessage = async () => {
  if (changedFileList.value && changedFileList.value?.length) {
    loadingGenerate.value = true;
    const commitPrompt = generateCommitPrompt(changedFileList.value);
    console.log('commitPrompt', commitPrompt);
    try {
      const { data } = await chatWithLinseer(
        endpoint.value || '',
        commitPrompt,
        [],
        accessToken.value || '',
      );
      commitMessage.value = data[0]?.code;
    } catch (e) {
      notify({
        type: 'negative',
        message: i18n('notifications.generateFailed'),
        caption: (<Error>e).message,
      });
    }
    loadingGenerate.value = false;
  }
};

const sendSvnCommitAction = () => {
  loadingCommit.value = true;
  window.actionApi.send({
    type: ActionType.SvnCommit,
    data: commitMessage.value,
  });
};

const sendSvnDiffAction = () => {
  loadingDiff.value = true;
  window.actionApi.send({
    type: ActionType.SvnDiff,
    data: undefined,
  });
};

onMounted(() => {
  actionApi.register(
    ActionType.ConfigStoreLoad,
    ({ apiStyle, config, data }) => {
      if (apiStyle == ApiStyle.Linseer) {
        accessToken.value = data.tokens.access;
      }
      endpoint.value = config.endpoints.aiService;
    },
  );
  actionApi.register(ActionType.SvnCommit, (result) => {
    switch (result) {
      case 'success': {
        notify({
          type: 'positive',
          message: i18n('notifications.commitSuccess'),
        });
        commitMessage.value = '';
        sendSvnDiffAction();
        break;
      }
      case 'invalidProject': {
        notify({
          type: 'warning',
          message: i18n('notifications.invalidProject'),
        });
        break;
      }
      default: {
        notify({
          type: 'negative',
          message: i18n('notifications.commitFailed'),
          caption: result,
        });
        sendSvnDiffAction();
        break;
      }
    }
    loadingCommit.value = false;
  });
  actionApi.register(ActionType.SvnDiff, (data) => {
    console.log('SvnDiff.response', data);
    if (data) {
      changedFileList.value = data;
    }
    loadingDiff.value = false;
  });
  window.actionApi.send(new ConfigStoreLoadActionMessage());
  sendSvnDiffAction();
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
        <q-splitter
          v-if="changedFileList"
          horizontal
          v-model="splitPercentage"
          style="height: 500px"
        >
          <template v-slot:before>
            <q-scroll-area class="full-height full-width">
              <q-list v-if="changedFileList.length" separator>
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
              <div v-else class="text-center text-grey text-h4 text-italic">
                {{ i18n('labels.noChanges') }}
              </div>
            </q-scroll-area>
          </template>
          <template v-slot:after>
            <q-scroll-area
              v-if="changedFileList[selectedIndex]"
              class="full-height full-width"
            >
              <div
                class="q-pa-sm"
                v-html="codeToHtml(changedFileList[selectedIndex].diff, 'diff')"
              />
            </q-scroll-area>
            <div v-else class="text-center text-grey text-h4 text-italic">
              {{ i18n('labels.noSelect') }}
            </div>
          </template>
        </q-splitter>
        <div v-else class="text-center text-grey text-h3 text-italic">
          {{ i18n('labels.invalidProject') }}
        </div>
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
          :disabled="!changedFileList || changedFileList.length === 0 || loadingCommit"
          icon="mdi-message-fast-outline"
          :loading="loadingGenerate"
          outline
          size="sm"
          @click="generateCommitMessage"
        >
          <q-tooltip
            anchor="bottom middle"
            self="top middle"
            transition-hide="jump-up"
            transition-show="jump-down"
          >
            {{
              loadingGenerate
                ? i18n('tooltips.generating')
                : i18n('tooltips.generate')
            }}
          </q-tooltip>
        </q-btn>
        <q-input
          clearable
          dense
          :disabled="
            !changedFileList || changedFileList.length === 0 || loadingCommit
          "
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
        :disabled="!commitMessage"
        :label="i18n('labels.commit')"
        :loading="loadingCommit"
        @click="sendSvnCommitAction"
      />
    </q-card-section>
  </q-page>
</template>

<style lang="scss" scoped>
.commit-message-input {
  position: relative;

  .generate-btn {
    position: absolute;
    right: 0;
    top: -30px;
    z-index: 100;
  }
}
</style>
