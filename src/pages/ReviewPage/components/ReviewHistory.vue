<script lang="ts" setup>
import { onMounted, ref } from 'vue';

const show = ref(false);
const mounted = ref(false);

onMounted(() => {
  mounted.value = true;
});
</script>
<template>
  <div class="review-history">
    <q-btn
      flat
      @click="
        () => {
          show = true;
        }
      "
      >History</q-btn
    >
    <template v-if="mounted">
      <Teleport to=".review-wrapper">
        <div class="history-content" v-if="show">
          <q-card class="bg-primary text-white">history </q-card>
        </div>
      </Teleport>
    </template>
  </div>
</template>

<style scoped lang="scss">
.review-history {
  position: relative;
}
.history-content {
  position: absolute;
  height: 100%;
  width: 100%;
  background-color: pink;
  z-index: 300;
}
</style>
