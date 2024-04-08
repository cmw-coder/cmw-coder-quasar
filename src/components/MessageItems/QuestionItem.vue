<script setup lang="ts">
interface Props {
  modelValue: string;
}

defineProps<Props>();
</script>

<template>
  <div class="text-white">
    {{ modelValue }}
  </div>
</template>
