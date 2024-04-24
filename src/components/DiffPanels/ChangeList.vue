<script setup lang="ts">
import { watch } from 'vue';

import { FileChanges } from 'shared/types/svn';

const props = defineProps<{ data: FileChanges[] }>();
const modelValue = defineModel<number>({ required: true });

const getLastDirName = (path: string) => {
  const pathArr = path.split('\\');
  return pathArr.at(-1);
};

watch(props.data, () => (modelValue.value = 0), { deep: true });
</script>

<template>
  <q-list separator>
    <q-item
      v-for="(item, index) in data"
      :key="index"
      :active="modelValue === index"
      active-class="bg-grey-4 text-black"
      clickable
      @click="modelValue = index"
    >
      <q-item-section avatar>
        <q-icon
          v-if="item.status === 'added'"
          name="mdi-file-document-plus"
          color="positive"
          size="2rem"
        />
        <q-icon
          v-if="item.status === 'missing'"
          name="mdi-file-document-minus"
          color="negative"
          size="2rem"
        />
        <q-icon
          v-if="item.status === 'modified'"
          name="mdi-file-document-edit"
          color="warn"
          size="2rem"
        />
      </q-item-section>
      <q-item-section>
        <q-item-label>
          {{ getLastDirName(item.path) }}
        </q-item-label>
        <q-item-label class="ellipsis" caption style="direction: rtl">
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
              (item.additions / (item.additions + item.deletions)) * 5
                ? 'positive'
                : sequence <=
                    (item.deletions / (item.additions + item.deletions)) * 5
                  ? 'negative'
                  : 'grey'
            "
          />
        </div>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<style scoped></style>
