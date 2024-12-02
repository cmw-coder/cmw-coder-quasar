<script setup lang="ts">
withDefaults(
  defineProps<{
    cacheOffset: number;
    currentCompletion: string;
    fontSize: number;
    height: number;
    transparentFallback?: boolean;
  }>(),
  {
    transparentFallback: false,
  },
);
</script>

<template>
  <div
    class="row q-pa-none"
    style="font-family: Consolas, monospace, serif; white-space: pre"
    :style="{
      fontSize: `${fontSize}px`,
      lineHeight: `${height - 1}px`,
    }"
  >
    <div v-show="transparentFallback && cacheOffset > 0" class="text-primary">
      {{ currentCompletion.substring(0, cacheOffset) }}
    </div>
    <div class="text-grey">
      {{
        ' '.repeat(transparentFallback ? 0 : cacheOffset) +
        currentCompletion.substring(cacheOffset)
      }}
    </div>
  </div>
</template>

<style scoped></style>
