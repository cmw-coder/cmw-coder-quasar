<script setup lang="ts">
import { ref } from 'vue';

import ProjectIdCard from 'components/DataManagementPanels/ProjectIdPanel.vue';
import { i18nSubPath } from 'utils/common';
import BackupPanel from 'components/DataManagementPanels/BackupPanel.vue';

const tabs = [
  {
    name: 'project',
    icon: 'mdi-folder-table-outline',
  },
  {
    name: 'backup',
    icon: 'mdi-backup-restore',
  },
];

const currentTab = ref(tabs[0].name);

const i18n = i18nSubPath('pages.DataManagementPage');
</script>

<template>
  <q-page class="column">
    <q-tabs
      class="bg-blue shadow-2 text-white"
      align="left"
      dense
      inline-label
      no-caps
      v-model="currentTab"
    >
      <q-tab
        v-for="(tab, index) in tabs"
        :key="index"
        :icon="tab.icon"
        :name="tab.name"
        :label="i18n(`tabs.${tab.name}`)"
      />
    </q-tabs>
    <q-tab-panels animated keep-alive v-model="currentTab">
      <q-tab-panel :name="tabs[0].name">
        <ProjectIdCard />
      </q-tab-panel>
      <q-tab-panel :name="tabs[1].name">
        <backup-panel />
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<style scoped></style>
