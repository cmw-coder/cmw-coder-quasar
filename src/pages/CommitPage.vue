<script lang="ts" setup>
import { useQuasar } from 'quasar';
import { PropType, computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import ChangeList from 'components/DiffPanels/ChangeList.vue';
import DiffDisplay from 'components/DiffPanels/DiffDisplay.vue';
import { ServiceType } from 'shared/types/service';
import { FileChanges } from 'shared/types/service/SvnServiceTrait/types';
import { WindowType } from 'shared/types/WindowType';
import { generateCommitPrompt } from 'utils/commitPrompt';
import { getLastDirName, useService } from 'utils/common';
import { api_questionStream } from '../request/api';

const props = defineProps({
  windowType: {
    type: String as PropType<WindowType>,
    default: WindowType.Commit,
  },
});

const { t } = useI18n();
const { notify } = useQuasar();
const svnService = useService(ServiceType.SVN);
const configService = useService(ServiceType.CONFIG);
const windowService = useService(ServiceType.WINDOW);

const baseName = 'pages.CommitPage.';

const i18n = (relativePath: string) => {
  return t(baseName + relativePath);
};

const currentFile = ref<string>('');
const loadingCommit = ref(false);
const loadingDiff = ref(false);
const loadingGenerate = ref(false);
const selectedFileIndex = ref(0);
const selectedSvnIndex = ref(0);
const splitPercentage = ref(40);
const svnList = ref<
  {
    path: string;
    changedFileList: FileChanges[];
    commitMessage: string;
  }[]
>([]);

const selectedSvn = computed(() => {
  return svnList.value[selectedSvnIndex.value];
});

const closeWindow = () => {
  windowService.closeWindow(WindowType.Commit);
};
const generateCommitMessageHandle = async () => {
  const appConfig = await configService.getConfigs();
  const changedFileList = selectedSvn.value.changedFileList;
  if (changedFileList && changedFileList.length) {
    loadingGenerate.value = true;
    const commitPrompt = generateCommitPrompt(changedFileList);
    try {
      await api_questionStream(
        {
          question: commitPrompt,
          productLine: appConfig.activeTemplate,
          profileModel: appConfig.activeModel,
          templateName: 'Chat',
        },
        (event) => {
          const responseText = event.event.target.responseText as string;
          selectedSvn.value.commitMessage = responseText
            .split('data:')
            .filter((item) => item.trim() !== '')
            .map((item) => JSON.parse(item.trim()).message)
            .join('');
        },
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

const refreshProjectList = async () => {
  currentFile.value = (await windowService.getCommitWindowCurrentFile()) || '';
  const res = await svnService.getAllProjectList();
  console.log('getAllProjectList', res, props.windowType, currentFile.value);
  svnList.value = res.map((item) => ({
    ...item,
    commitMessage: '',
  }));
  selectedSvnIndex.value = svnList.value.findIndex((item) =>
    currentFile.value.includes(item.path),
  );
  if (selectedSvnIndex.value === -1) {
    selectedSvnIndex.value = 0;
  }
};

const sendSvnCommitAction = async () => {
  loadingCommit.value = true;
  try {
    await svnService.commit(
      selectedSvn.value.path,
      selectedSvn.value.commitMessage,
    );
    notify({
      type: 'positive',
      message: i18n('notifications.commitSuccess'),
    });
    refreshProjectList().catch();
    // createWorkflow(
    //   activeProject.value.path,
    //   activeProject.value.commitMessage,
    //   'administrator',
    // ).catch();
    if (props.windowType === WindowType.Commit) {
      setTimeout(() => closeWindow(), 2000);
    }
  } catch (e) {
    notify({
      type: 'negative',
      message: i18n('notifications.commitFailed'),
      caption: (<Error>e).message,
    });
  }
  loadingCommit.value = false;
};

onMounted(() => {
  refreshProjectList();
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
            {{ i18n('labels.selectRepo') }}
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
        <q-tabs v-if="svnList.length" v-model="selectedSvnIndex">
          <q-tab
            v-for="(item, index) in svnList"
            :key="index"
            :label="getLastDirName(item.path)"
            :name="index"
          >
            <q-tooltip>{{ item.path }}</q-tooltip>
          </q-tab>
        </q-tabs>
        <q-skeleton v-else type="QToolbar" />
      </div>
      <div class="column q-gutter-y-md">
        <div class="text-bold text-grey text-h6">
          {{ i18n('labels.changes') }}
        </div>
        <q-card
          v-if="selectedSvn?.changedFileList"
          class="diff-card row items-center justify-center"
          bordered
          flat
        >
          <q-splitter
            class="full-height full-width"
            :disable="loadingDiff"
            horizontal
            v-model="splitPercentage"
          >
            <template v-slot:before>
              <q-scroll-area class="full-height full-width">
                <change-list
                  :data="selectedSvn.changedFileList"
                  v-model="selectedFileIndex"
                />
              </q-scroll-area>
            </template>
            <template v-slot:after>
              <q-scroll-area
                v-if="selectedSvn.changedFileList[selectedFileIndex]"
                class="full-height full-width"
              >
                <diff-display
                  v-model="selectedSvn.changedFileList[selectedFileIndex].diff"
                />
              </q-scroll-area>
              <div v-else class="text-center text-grey text-h4 text-italic">
                {{ i18n('labels.noSelect') }}
              </div>
            </template>
          </q-splitter>
        </q-card>
        <q-skeleton v-else class="diff-card rounded-borders" square />
      </div>
      <div class="column q-gutter-y-md">
        <div class="row items-baseline justify-between">
          <div class="text-bold text-grey text-h6">
            {{ i18n('labels.message') }}
          </div>
          <q-btn
            color="accent"
            dense
            :disabled="!selectedSvn?.changedFileList?.length || loadingCommit"
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
          v-if="selectedSvn"
          :autofocus="!!selectedSvn?.changedFileList?.length"
          autogrow
          clearable
          dense
          :disable="!selectedSvn?.changedFileList?.length || loadingCommit"
          :maxlength="400"
          outlined
          v-model="selectedSvn.commitMessage"
        />
        <q-skeleton v-else type="QInput" />
      </div>
      <div class="row q-gutter-x-md">
        <q-btn
          v-if="windowType === WindowType.Commit"
          class="col-grow"
          flat
          :label="i18n('labels.cancel')"
          :loading="loadingCommit"
          @click="closeWindow"
        />
        <q-btn
          class="col-grow"
          color="primary"
          :disabled="!selectedSvn?.commitMessage"
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
  height: calc(100vh - 630px);
  min-height: 250px;
}
</style>
