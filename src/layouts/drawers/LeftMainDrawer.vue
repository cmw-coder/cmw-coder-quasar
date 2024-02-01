<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { bus } from 'boot/bus';

const { t } = useI18n();

const i18n = (relativePath: string) => {
  return t('layouts.drawers.LeftMainDrawer.' + relativePath);
};

const navigations = [
  {
    label: 'chat',
    icon: 'mdi-forum-outline',
    available: true,
    route: 'chat',
    separator: true,
  },
  {
    label: 'feedback',
    icon: 'mdi-bug',
    available: true,
    route: 'feedback',
    separator: true,
  },
  {
    label: 'settings',
    icon: 'mdi-cog',
    available: true,
    route: 'settings',
    separator: true,
  },
];
</script>

<template>
  <q-drawer
    behavior="desktop"
    bordered
    no-swipe-backdrop
    no-swipe-close
    no-swipe-open
    overlay
    side="left"
    @show="bus.emit('drawer', 'left', 'open')"
    @hide="bus.emit('drawer', 'left', 'close')"
  >
    <q-list>
      <template v-for="navigation in navigations" :key="navigation">
        <q-item
          :clickable="navigation.available"
          :v-ripple="navigation.available"
          @click="$router.push(navigation.route)"
        >
          <q-item-section avatar>
            <q-icon
              :name="navigation.icon"
              :color="navigation.available ? 'primary' : 'grey'"
            />
          </q-item-section>
          <q-item-section :class="navigation.available ? '' : 'text-grey'">
            {{ i18n('navigations.' + navigation.label) }}
          </q-item-section>
        </q-item>
        <q-separator v-if="navigation.separator" />
      </template>
    </q-list>
  </q-drawer>
</template>

<style scoped></style>
