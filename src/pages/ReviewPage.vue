<script lang="ts" setup>
// import { useQuasar } from 'quasar';
import { PropType, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

// import { ServiceType } from 'shared/types/service';
import { WindowType } from 'shared/types/WindowType';
// import { useService } from 'utils/common';

const props = defineProps({
  windowType: {
    type: String as PropType<WindowType>,
    default: WindowType.Commit,
  },
});

const { t } = useI18n();
// const { notify } = useQuasar();
// const configService = useService(ServiceType.CONFIG);
// const windowService = useService(ServiceType.WINDOW);

const baseName = 'pages.ReviewPage.';

const i18n = (relativePath: string) => {
  return t(baseName + relativePath);
};

// const currentFile = ref<string>('');

onMounted(() => {
  console.log('CommitPage mounted', props.windowType);
});
</script>

<template>
  <q-page class="row items-center justify-evenly q-pa-xl">
    <div class="column col-grow q-gutter-y-md">
      <div class="text-center text-h4">
        {{ i18n('labels.title') }}
      </div>
      <div class="column q-gutter-y-md"></div>
      <div class="column q-gutter-y-md"></div>
      <div class="column q-gutter-y-md"></div>
      <div class="row q-gutter-x-md"></div>
    </div>
  </q-page>
</template>

<style lang="scss" scoped></style>
