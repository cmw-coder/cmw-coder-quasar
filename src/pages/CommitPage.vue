<script lang="ts" setup>
import { useQuasar } from 'quasar';
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import {
  ActionType,
  ConfigStoreLoadActionMessage,
} from 'shared/types/ActionMessage';
import { ApiStyle } from 'shared/types/model';
import { ChangedFile } from 'shared/types/svn';
import { WindowType } from 'shared/types/WindowType';
import { useHighlighter } from 'stores/highlighter';
import { useWorkflowStore } from 'stores/workflow';
import { ActionApi } from 'types/ActionApi';
import { CommitQuery } from 'types/queries';
import {
  generateCommitMessage,
  generateCommitPrompt,
} from 'utils/commitPrompt';
import useService from 'boot/useService';
import { TYPES } from 'app/src-electron/shared/service-interface/types';

const { codeToHtml } = useHighlighter();
const { createWorkflow } = useWorkflowStore();
const { t } = useI18n();
const { notify } = useQuasar();
const { matched, query } = useRoute();
const { push } = useRouter();

const baseName = 'pages.CommitPage.';
const { name } = matched[matched.length - 2];

const i18n = (relativePath: string) => {
  return t(baseName + relativePath);
};

const svnService = useService(TYPES.SvnService);
const projectList = ref<
  {
    path: string;
    changedFileList: ChangedFile[];
    commitMessage: string;
  }[]
>([]);

const refreshProjectList = async () => {
  const res = await svnService.getAllProjectList();
  projectList.value = res.map((item) => ({
    ...item,
    commitMessage: '',
  }));
  activeProjectIndex.value = projectList.value.findIndex((item) =>
    commitQuery.currentFile.includes(item.path),
  );
  if (activeProjectIndex.value === -1) {
    activeProjectIndex.value = 0;
  }
};

const activeProjectIndex = ref<number>(0);

const commitQuery = new CommitQuery(query);

const accessToken = ref<string>();
const endpoint = ref<string>();
const loadingCommit = ref(false);
const loadingDiff = ref(false);
const loadingGenerate = ref(false);
const selectedIndex = ref(0);
const splitPercentage = ref(40);

const activeProject = computed(() => {
  return projectList.value[activeProjectIndex.value];
});

const closeWindow = () => window.controlApi.hide(WindowType.Floating);

const generateCommitMessageHandle = async () => {
  const changedFileList = activeProject.value.changedFileList;
  if (changedFileList && changedFileList.length) {
    loadingGenerate.value = true;
    const commitPrompt = generateCommitPrompt(changedFileList);
    try {
      activeProject.value.commitMessage = await generateCommitMessage(
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

const sendSvnCommitAction = async () => {
  loadingCommit.value = true;
  try {
    await svnService.commit(
      activeProject.value.path,
      activeProject.value.commitMessage,
    );
    refreshProjectList();
    notify({
      type: 'positive',
      message: i18n('notifications.commitSuccess'),
    });
    createWorkflow(
      activeProject.value.path,
      activeProject.value.commitMessage,
      'administrator',
    ).catch();
    setTimeout(() => {
      push('/main/workflow');
    }, 1500);
  } catch (e) {
    notify({
      type: 'negative',
      message: i18n('notifications.commitFailed'),
      caption: (<Error>e).message,
    });
  }
  loadingCommit.value = false;
};

const actionApi = new ActionApi(baseName);
onMounted(() => {
  refreshProjectList();
  actionApi.register(
    ActionType.ConfigStoreLoad,
    ({ apiStyle, config, data }) => {
      if (apiStyle == ApiStyle.Linseer) {
        accessToken.value = data.tokens.access;
      }
      endpoint.value = config.endpoints.aiService;
    },
  );
  window.actionApi.send(new ConfigStoreLoadActionMessage());
});

const getLastDirName = (path: string) => {
  const pathArr = path.split('\\');
  return pathArr[pathArr.length - 1];
};
</script>

<template>
  <q-page class="row items-center justify-evenly q-pa-xl">
    <div v-if="activeProject" class="side-bar">
      <q-list bordered separator>
        <q-item
          v-for="(item, index) in projectList"
          :key="item.path"
          clickable
          v-ripple
          :active="index === activeProjectIndex"
          @click="
            () => {
              activeProjectIndex = index;
              selectedIndex = 0;
            }
          "
        >
          <q-item-section>
            <q-tooltip>
              {{ item.path }}
            </q-tooltip>
            {{ getLastDirName(item.path) }}
          </q-item-section>
        </q-item>
      </q-list>
    </div>
    <div
      v-if="activeProject"
      class="column col-grow q-gutter-y-md"
      style="padding-left: 140px"
    >
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
            @click="refreshProjectList"
          />
        </div>
        <q-card class="diff-card row items-center justify-center" bordered flat>
          <q-splitter
            v-if="activeProject.changedFileList"
            class="full-height full-width"
            :disable="loadingDiff"
            horizontal
            v-model="splitPercentage"
          >
            <template v-slot:before>
              <q-scroll-area class="full-height full-width">
                <q-list v-if="activeProject.changedFileList.length" separator>
                  <q-item
                    v-for="(item, index) in activeProject.changedFileList"
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
                v-if="activeProject.changedFileList[selectedIndex]"
                class="full-height full-width"
              >
                <div
                  class="q-pa-sm"
                  v-html="
                    codeToHtml(
                      activeProject.changedFileList[selectedIndex].diff,
                      'diff',
                    )
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
              !activeProject.changedFileList ||
              !activeProject.changedFileList.length ||
              loadingCommit
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
          :autofocus="
            !!(
              activeProject.changedFileList &&
              activeProject.changedFileList.length
            )
          "
          autogrow
          clearable
          dense
          :disable="
            !activeProject.changedFileList ||
            !activeProject.changedFileList.length ||
            loadingCommit
          "
          :maxlength="400"
          outlined
          v-model="activeProject.commitMessage"
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
          :disabled="!activeProject.commitMessage"
          :label="i18n('labels.commit')"
          :loading="loadingCommit"
          no-caps
          @click="sendSvnCommitAction"
        />
      </div>
    </div>
    <div v-if="!activeProject" class="text-center text-h4">
      {{ i18n('labels.noProject') }}
    </div>
  </q-page>
</template>

<style lang="scss" scoped>
.side-bar {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 140px;
  height: 100%;
  background-color: #f5f5f5;
}

.diff-card {
  height: calc(100vh - 500px);
  min-height: 250px;
}
</style>
