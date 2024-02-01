<script setup lang="ts">
import { useQuasar } from 'quasar';
import { ref } from 'vue';
import { bus } from 'boot/bus';

const { screen } = useQuasar();
const leftDrawerOpen = ref(false);
const rightDrawerOpen = ref(false);

bus.on('drawer', (position, action) => {
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
</script>

<template>
  <q-layout view="hHh LpR fFf">
    <router-view
      :mobile="screen.lt.md"
      name="header"
    />
    <router-view
      :mobile="screen.lt.md"
      :model-value="leftDrawerOpen"
      name="leftDrawer"
    />
    <q-page-container>
      <router-view />
    </q-page-container>
    <router-view
      :mobile="screen.lt.md"
      :model-value="rightDrawerOpen"
      name="rightDrawer"
    />
    <router-view
      :mobile="screen.lt.md"
      name="footer"
    />
  </q-layout>
</template>
