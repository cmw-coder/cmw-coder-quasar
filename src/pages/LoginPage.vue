<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import AccountPanel from 'components/LoginPanels/AccountPanel.vue';
import CodePanel from 'components/LoginPanels/CodePanel.vue';
import { useService } from 'utils/common';
import { ServiceType } from 'shared/types/service';

const { t } = useI18n();

const i18n = (relativePath: string) => {
  return t('pages.LoginPage.' + relativePath);
};

const configService = useService(ServiceType.CONFIG);
// const windowService = useService(ServiceType.WINDOW);

const account = ref('');
const tabIndex = ref(0);

const finish = () => {
  console.log('finish');
};

onMounted(async () => {
  account.value = await configService.getConfig('username') ?? '';
});
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
