<script lang="ts" setup>
import { reactive } from 'vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const baseName = 'pages.CommitPage.';

const i18n = (relativePath: string) => {
  return t(baseName + relativePath);
};

const commitForm = reactive({
  diff: `
  .../main/components/WebsocketManager/index.ts  | 14 +++++-
  src-electron/main/windows/MainWindow.ts        | 12 ++++-
  src-electron/shared/types/ActionMessage.ts     | 11 +++++
  src-electron/shared/types/WsMessage.ts         | 57 +++++++++++++---------
  src/components/MessageItems/AnswerItem.vue     | 13 ++---
  `,
  message: 'xxx',
});

const generateCommitMessage = () => {
  commitForm.message = `
  feat: add CommitPage.vue file
  fix: fix data store merge error
  docs: update docs
  `;
};
</script>

<template>
  <q-page class="column justify-evenly q-pa-xl">
    <q-card class="col-grow q-pa-lg" style="width: 100%">
      <q-card-section class="text-h4 text-center">
        {{ i18n('labels.title') }}
      </q-card-section>
      <q-card-section class="column q-gutter-y-md">
        <div class="column q-gutter-y-sm">
          <div class="text-bold text-grey text-h6">
            {{ i18n('labels.diff') }}
          </div>
        </div>
        <pre class="diff-pre">
          <code>
            {{ commitForm.diff }}
          </code>
        </pre>
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
            v-model="commitForm.message"
            counter
            dense
            :maxlength="400"
            outlined
            type="textarea"
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
    </q-card>
  </q-page>
</template>

<style lang="scss" scoped>
.diff-pre {
  overflow-x: auto;
  width: 100%;
  background-color: #454545;
  padding: 0 10px;
  color: white;
}

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
