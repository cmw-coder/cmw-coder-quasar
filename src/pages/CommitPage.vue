<script lang="ts" setup>
import { useQuasar } from 'quasar';
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import {
  ActionType,
  ConfigStoreLoadActionMessage,
} from 'shared/types/ActionMessage';
import { ApiStyle } from 'shared/types/model';
import { ChangedFile } from 'shared/types/svn';
import { WindowType } from 'shared/types/WindowType';
import { useHighlighter } from 'stores/highlighter';
import { ActionApi } from 'types/ActionApi';
import {
  generateCommitMessage,
  generateCommitPrompt,
} from 'utils/commitPrompt';
import { useInvokeService } from 'boot/useInvokeService';

const { codeToHtml } = useHighlighter();
const { t } = useI18n();
const { notify } = useQuasar();
const { matched } = useRoute();

const baseName = 'pages.CommitPage.';
const { name } = matched[matched.length - 2];

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
const splitPercentage = ref(40);

const closeWindow = () => window.controlApi.hide(WindowType.Floating);

const generateCommitMessageHandle = async () => {
  if (changedFileList.value && changedFileList.value?.length) {
    loadingGenerate.value = true;
    const commitPrompt = generateCommitPrompt(changedFileList.value);
    try {
      commitMessage.value = await generateCommitMessage(
        endpoint.value || '',
        commitPrompt,
        accessToken.value,
      );
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

const sendSvnDiffAction = async () => {
  const invokeService = useInvokeService();
  const res = await invokeService.sayHello('CommitPage');
  console.log('sayHello', res);

  return;
  loadingDiff.value = true;
  window.actionApi.send({
    type: ActionType.SvnDiff,
    data: undefined,
  });
};

const actionApi = new ActionApi(baseName);
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
        if (name === WindowType.Floating) {
          setTimeout(closeWindow, 2000);
        } else {
          sendSvnDiffAction();
        }
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
  <q-page class="row items-center justify-evenly q-pa-xl">
    <div class="column col-grow q-gutter-y-md">
      <div class="text-center text-h4">
        {{ i18n('labels.title') }}
      </div>
      <div class="column q-gutter-y-md">
        <div class="row items-baseline justify-between">
          <div class="text-bold text-grey text-h6">
            {{ i18n('labels.changes') }}
          </div>
          <q-btn
            color="primary"
            dense
            icon="mdi-refresh"
            :label="i18n('labels.refresh')"
            :loading="loadingDiff"
            no-caps
            outline
            @click="sendSvnDiffAction"
          />
        </div>
        <q-card class="diff-card row items-center justify-center" bordered flat>
          <q-splitter
            v-if="changedFileList"
            class="full-height full-width"
            :disable="loadingDiff"
            horizontal
            v-model="splitPercentage"
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
                            (item.additions /
                              (item.additions + item.deletions)) *
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
                  v-html="
                    codeToHtml(changedFileList[selectedIndex].diff, 'diff')
                  "
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
      </div>
      <div class="column q-gutter-y-md">
        <div class="row items-baseline justify-between">
          <div class="text-bold text-grey text-h6">
            {{ i18n('labels.message') }}
          </div>
          <q-btn
            color="accent"
            dense
            :disabled="
              !changedFileList || !changedFileList.length || loadingCommit
            "
            icon="mdi-creation"
            :label="i18n('labels.generate')"
            :loading="loadingGenerate"
            no-caps
            outline
            @click="generateCommitMessageHandle"
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
        </div>
        <q-input
          :autofocus="!!(changedFileList && changedFileList.length)"
          autogrow
          clearable
          dense
          :disable="
            !changedFileList || !changedFileList.length || loadingCommit
          "
          :maxlength="400"
          outlined
          v-model="commitMessage"
        />
      </div>
      <div class="row q-gutter-x-md">
        <q-btn
          v-if="name === WindowType.Floating"
          class="col-grow"
          flat
          :label="i18n('labels.cancel')"
          :loading="loadingCommit"
          @click="closeWindow"
        />
        <q-btn
          class="col-grow"
          color="primary"
          :disabled="!commitMessage"
          :label="i18n('labels.commit')"
          :loading="loadingCommit"
          no-caps
          @click="sendSvnCommitAction"
        />
      </div>
    </div>
  </q-page>
</template>

<style lang="scss" scoped>
.diff-card {
  height: calc(100vh - 500px);
  min-height: 250px;
}
</style>
