<script setup lang="ts">
import { useQuasar } from 'quasar';
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { bus } from 'boot/bus';
import { ActionApi } from 'types/ActionApi';
import { ActionType } from 'shared/types/ActionMessage';
import { useRouter } from 'vue-router';
import { MAIN_WINDOW_PAGE_URL_MAPPING } from 'app/src-electron/shared/constants/common';

const { screen } = useQuasar();
const leftDrawerOpen = ref(false);
const rightDrawerOpen = ref(false);

const actionApi = new ActionApi('web.app.main.layout');

const router = useRouter();

bus.on('drawer', (action, position) => {
  const targetDrawer = position === 'left' ? leftDrawerOpen : rightDrawerOpen;
  switch (action) {
    case 'open':
      targetDrawer.value = true;
      break;
    case 'close':
      targetDrawer.value = false;
      break;
    case 'toggle':
      targetDrawer.value = !targetDrawer.value;
      break;
  }
});

onMounted(() => {
  actionApi.register(ActionType.MainWindowActivePage, (type) => {
    console.log('MainWindowActivePage', type);
    router.push(MAIN_WINDOW_PAGE_URL_MAPPING[type]);
  });
});

onBeforeUnmount(() => {
  actionApi.unregister();
});
</script>

<template>
  <q-layout view="hHh LpR lFf">
    <router-view :mobile="screen.lt.md" name="header" />
    <router-view
      :mobile="screen.lt.md"
      :model-value="leftDrawerOpen"
      name="leftDrawer"
    />
    <q-page-container style="height: 100vh">
      <router-view />
    </q-page-container>
    <router-view
      :mobile="screen.lt.md"
      :model-value="rightDrawerOpen"
      name="rightDrawer"
    />
    <router-view :mobile="screen.lt.md" name="footer" />
  </q-layout>
</template>
