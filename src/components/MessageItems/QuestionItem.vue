<script setup lang="ts">
interface Props {
  modelValue: string;
}

defineProps<Props>();
</script>

<template>
  {{ modelValue }}
</template>
