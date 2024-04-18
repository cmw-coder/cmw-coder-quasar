<script setup lang="ts">
import { Workflow } from 'stores/workflow/types';

interface Props {
  status: Workflow['status'];
}

defineProps<Props>();
</script>

<template>
  <q-icon
    v-if="status === 'failure'"
    name="mdi-close-circle"
    color="negative"
    size="2rem"
  />
  <q-spinner-clock
    v-else-if="status === 'pending'"
    color="primary"
    size="1.75rem"
    style="margin-left: 0.1rem"
  />
  <div
    v-else-if="status === 'running'"
    class="row justify-center items-center"
    style="margin-left: 0.1rem"
  >
    <q-spinner-oval color="amber" size="1.75rem" />
    <q-icon class="absolute" color="amber" name="circle" size="xs" />
  </div>
  <q-icon v-else name="mdi-check-circle" color="positive" size="2rem" />
</template>

<style scoped></style>
