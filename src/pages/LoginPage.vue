<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import AccountPanel from 'components/LoginPanels/AccountPanel.vue';
import CodePanel from 'components/LoginPanels/CodePanel.vue';
import { WindowType } from 'shared/types/WindowType';
import { LoginQuery } from 'types/queries';

const { t } = useI18n();
const { matched, query } = useRoute();
const { replace } = useRouter();

const i18n = (relativePath: string) => {
  return t('pages.LoginPage.' + relativePath);
};

const { name } = matched[matched.length - 2];

const loginQuery = new LoginQuery(query);

const account = ref(loginQuery.userId);
const tabIndex = ref(0);

const finish = () => {
  if (loginQuery.showMain) {
    window.controlApi.show(WindowType.Main);
  }
  switch (name) {
    case WindowType.Floating: {
      window.controlApi.close(WindowType.Floating);
      break;
    }
    case WindowType.Main: {
      replace('completions');
      break;
    }
  }
};
</script>

<template>
  <q-page class="row flex-center q-pa-lg">
    <div class="col-10 column">
      <div class="q-gutter-y-lg">
        <div class="text-bold text-center text-h2">
          {{ i18n('labels.title') }}
        </div>
      </div>
      <q-tab-panels class="transparent" animated keep-alive v-model="tabIndex">
        <q-tab-panel :name="0">
          <account-panel v-model="account" @navigate="tabIndex = 1" />
        </q-tab-panel>
        <q-tab-panel :name="1">
          <code-panel
            v-model="account"
            @navigate="tabIndex = 0"
            @finish="finish"
          />
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </q-page>
</template>

<style scoped></style>
