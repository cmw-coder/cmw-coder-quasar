<script setup lang="ts">
import { StepInfo } from 'stores/workflow/types';

interface Props {
  status: StepInfo['status'];
}

defineProps<Props>();
</script>

<template>
  <q-icon
    v-if="status === 'failure'"
    name="mdi-close-circle"
    color="negative"
    size="sm"
  />
  <q-icon
    v-else-if="status === 'pending'"
    name="mdi-clock-outline"
    color="primary"
    size="sm"
  />
  <q-icon
    v-else-if="status === 'running'"
    name="mdi-circle-slice-8"
    color="amber"
    size="sm"
  />
  <q-icon
    v-else-if="status === 'skipped'"
    name="mdi-cancel"
    color="grey"
    size="sm"
  />
  <q-icon v-else name="mdi-check-circle" color="positive" size="sm" />
</template>

<style scoped></style>
