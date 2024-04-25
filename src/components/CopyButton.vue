<script setup lang="ts">
defineEmits(['click']);

defineModel<number>('x', { required: true });
defineModel<number>('y', { required: true });
</script>

<template>
  <q-card
    class="fixed z-max"
    bordered
    :style="{ left: `${x}px`, top: `${y}px` }"
  >
    <q-btn
      icon="mdi-content-copy"
      dense
      flat
      color="primary"
      @click="$emit('click')"
    />
  </q-card>
</template>

<style scoped></style>
