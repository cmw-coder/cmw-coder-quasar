<script lang="ts" setup>
import {
  TransplantProjectData,
  TransplantProjectOptions,
} from 'shared/types/transplantProject';
import { onBeforeUnmount, onMounted, reactive, ref, toRaw } from 'vue';
import { useService } from 'utils/common';
import { ServiceType } from 'shared/types/service';

const windowService = useService(ServiceType.WINDOW);

const activeTransplantProject = ref<undefined | TransplantProjectData>();

const refreshActiveData = async () => {
  activeTransplantProject.value =
    await windowService.getTransplantProjectData();
};
let refreshInterval: NodeJS.Timer | undefined = undefined;
onMounted(() => {
  refreshActiveData();

  refreshInterval = setInterval(refreshActiveData, 1000);
});

onBeforeUnmount(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = undefined;
  }
});

const transplantProjectOptions = reactive<TransplantProjectOptions>({
  projectDirPath: 'D:\\project\\cmw-coder\\cmw-coder-quasar',
  originBranch: 'V7',
  targetBranch: 'V9',
});
const onSubmit = async () => {
  await windowService.createTransplantProject(toRaw(transplantProjectOptions));
  refreshActiveData();
};
const onReset = async () => {};
</script>

<template>
  <q-page>
    <div v-if="!activeTransplantProject" class="q-pa-md flex-center">
      <q-form @submit="onSubmit" @reset="onReset" class="q-gutter-md">
        <q-input
          filled
          v-model="transplantProjectOptions.projectDirPath"
          type="text"
          label="项目路径"
        />

        <q-input
          filled
          type="text"
          v-model="transplantProjectOptions.originBranch"
          label="源分支"
        />

        <q-input
          filled
          type="text"
          v-model="transplantProjectOptions.targetBranch"
          label="目标分支"
        />
        <div>
          <q-btn label="开始移植" type="submit" color="primary" />
        </div>
      </q-form>
    </div>
    <div v-else>
      <div class="q-pa-md">
        <q-stepper v-model="step" vertical color="primary" animated>
          <q-step
            :name="1"
            title="Select campaign settings"
            icon="settings"
            :done="step > 1"
          >
            For each ad campaign that you create, you can control how much
            you're willing to spend on clicks and conversions, which networks
            and geographical locations you want your ads to show on, and more.

            <q-stepper-navigation>
              <q-btn @click="step = 2" color="primary" label="Continue" />
            </q-stepper-navigation>
          </q-step>

          <q-step
            :name="2"
            title="Create an ad group"
            caption="Optional"
            icon="create_new_folder"
            :done="step > 2"
          >
            An ad group contains one or more ads which target a shared set of
            keywords.

            <q-stepper-navigation>
              <q-btn @click="step = 4" color="primary" label="Continue" />
              <q-btn
                flat
                @click="step = 1"
                color="primary"
                label="Back"
                class="q-ml-sm"
              />
            </q-stepper-navigation>
          </q-step>

          <q-step :name="3" title="Ad template" icon="assignment" disable>
            This step won't show up because it is disabled.
          </q-step>

          <q-step :name="4" title="Create an ad" icon="add_comment">
            Try out different ad text to see what brings in the most customers,
            and learn how to enhance your ads using features like ad extensions.
            If you run into any problems with your ads, find out how to tell if
            they're running and how to resolve approval issues.

            <q-stepper-navigation>
              <q-btn color="primary" label="Finish" />
              <q-btn
                flat
                @click="step = 2"
                color="primary"
                label="Back"
                class="q-ml-sm"
              />
            </q-stepper-navigation>
          </q-step>
        </q-stepper>
      </div>
    </div>
  </q-page>
</template>
