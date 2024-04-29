<script lang="ts" setup>
import { ref } from 'vue';
import { QStepper } from 'quasar';
const baseName = 'pages.StartSettingPage.';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const i18n = (relativePath: string) => {
  return t(baseName + relativePath);
};

const step = ref(1);
const stepper = ref(null as unknown as InstanceType<typeof QStepper>);
</script>

<template>
  <div class="start-setting">
    <div class="q-pa-md">
      <div class="text-h4 text-center" style="padding-bottom: 20px">
        {{ i18n('labels.title') }}
      </div>
      <q-stepper v-model="step" ref="stepper" color="primary" animated>
        <q-step
          :name="1"
          :title="i18n('labels.stepOneTitle')"
          icon="settings"
          :done="step > 0"
        >
          For each ad campaign that you create, you can control how much you're
          willing to spend on clicks and conversions, which networks and
          geographical locations you want your ads to show on, and more.
        </q-step>

        <q-step
          :name="2"
          :title="i18n('labels.stepTwoTitle')"
          icon="settings"
          :done="step > 1"
        >
          An ad group contains one or more ads which target a shared set of
          keywords.
        </q-step>

        <template v-slot:navigation>
          <q-stepper-navigation>
            <q-btn
              @click="stepper.next()"
              color="primary"
              :label="step === 2 ? 'Finish' : 'Continue'"
            />
            <q-btn
              v-if="step > 1"
              flat
              color="primary"
              @click="stepper.previous()"
              label="Back"
              class="q-ml-sm"
            />
          </q-stepper-navigation>
        </template>
      </q-stepper>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.start-setting {
  height: calc(100vh - 33px);
  width: 100vw;
  overflow-y: auto;
}
</style>
