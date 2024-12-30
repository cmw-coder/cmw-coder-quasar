<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { DEFAULT_SERVER_URL_MAP } from 'shared/types/service/ConfigServiceTrait/constants';
import { NetworkZone } from 'shared/types/service/ConfigServiceTrait/types';

import { checkUrlAccessible } from 'utils/common';

const baseName = 'components.WelcomePanels.AutoPanel.';

const { t } = useI18n();

const i18n = (relativePath: string) => {
  return t(baseName + relativePath);
};

const emit = defineEmits<{
  go: [offset: number];
  finish: [
    data: {
      url: string;
      zone: NetworkZone;
    },
  ];
}>();

const networkZone = ref(NetworkZone.Normal);
const serverUrl = ref('');

onMounted(async () => {
  const results = new Map<NetworkZone, boolean>(
    <[NetworkZone, boolean][]>(
      await Promise.all(
        [NetworkZone.Normal, NetworkZone.Secure, NetworkZone.Public].map(
          async (zone: NetworkZone) => [
            zone,
            await checkUrlAccessible(
              `${DEFAULT_SERVER_URL_MAP[zone]}/h3c-ai-assistant/`,
            ),
          ],
        ),
      )
    ),
  );
  for (const [zone, result] of results) {
    if (result) {
      networkZone.value = zone;
      serverUrl.value = DEFAULT_SERVER_URL_MAP[networkZone.value];
      setTimeout(async () => {
        emit('finish', { zone: networkZone.value, url: serverUrl.value });
      }, 2000);
      return;
    }
  }
  emit('go', 1);
});
</script>

<template>
  <div class="column items-center q-gutter-y-md">
    <q-spinner-radio size="10rem" />
    <div class="text-h3">
      {{ i18n('labels.title') }}
    </div>
  </div>
</template>

<style scoped></style>
