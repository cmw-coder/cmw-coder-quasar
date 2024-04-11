<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { copyToClipboard, useQuasar } from 'quasar';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { useWorkflowStore } from 'stores/workflow';
import WorkflowStatus from 'components/WorkflowItems/WorkflowStatus.vue';
import StepStatus from 'components/WorkflowItems/StepStatus.vue';

const { notify } = useQuasar();
const { t } = useI18n();
const { deleteWorkflow } = useWorkflowStore();
const { workflows } = storeToRefs(useWorkflowStore());

const baseName = 'pages.WorkflowPage.';

const i18n = (relativePath: string) => {
  return t(baseName + relativePath);
};

const selectedIndex = ref(workflows.value.length - 1);
const splitPercentage = ref(50);

const copyWorkflowId = (id: string) =>
  copyToClipboard(id)
    .then(() =>
      notify({
        type: 'positive',
        message: i18n('notifications.copySuccess'),
      }),
    )
    .catch(() =>
      notify({
        type: 'negative',
        message: i18n('notifications.copyFailure'),
      }),
    );

const selectWorkflow = (index: number) => {
  selectedIndex.value = index;
  console.log(workflows.value[index]);
};
</script>

<template>
  <q-page class="flex">
    <div class="full-width" style="height: calc(100vh - 83px)">
      <q-splitter class="full-height" horizontal v-model="splitPercentage">
        <template v-slot:before>
          <q-scroll-area class="full-height full-width">
            <q-list v-if="workflows.length" separator>
              <q-item
                v-for="(item, index) in workflows"
                :key="index"
                :active="selectedIndex === index"
                active-class="bg-grey-4 text-black"
                clickable
                @click="selectWorkflow(index)"
              >
                <q-item-section avatar>
                  <WorkflowStatus :status="item.status" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>
                    {{ item.name }}
                  </q-item-label>
                  <q-item-label caption>
                    Started by {{ item.creator }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn dense flat icon="mdi-dots-horizontal">
                    <q-menu>
                      <q-list style="min-width: 100px">
                        <q-item
                          clickable
                          v-close-popup
                          @click="copyWorkflowId(item.id)"
                        >
                          <q-item-section>
                            {{ i18n('labels.copyWorkflowId') }}
                          </q-item-section>
                        </q-item>
                        <q-item
                          clickable
                          v-close-popup
                          @click="deleteWorkflow(item.id)"
                        >
                          <q-item-section class="text-red text-weight-bold">
                            {{ i18n('labels.deleteWorkflow') }}
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-btn>
                </q-item-section>
              </q-item>
            </q-list>
          </q-scroll-area>
        </template>
        <template v-slot:after>
          <q-scroll-area class="full-height full-width">
            <q-list v-if="workflows[selectedIndex]?.steps?.length" separator>
              <q-expansion-item
                v-for="(item, index) in workflows[selectedIndex].steps"
                :key="index"
                :disable="
                  item.status === 'pending' || item.status === 'skipped'
                "
                expand-separator
                :model-value="
                  workflows[selectedIndex].status === 'running'
                    ? item.status === 'running'
                    : item.status === 'failure'
                "
              >
                <template v-slot:header>
                  <q-item-section avatar>
                    <StepStatus :status="item.status" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>
                      {{ item.name }}
                    </q-item-label>
                  </q-item-section>
                </template>
                <q-card>
                  <q-card-section
                    style="white-space: pre; word-break: break-word"
                  >
                    <div
                      v-if="item.status === 'running'"
                      class="row items-center q-gutter-x-md"
                    >
                      <q-spinner color="primary" />
                      <div class="text-grey text-italic">
                        {{ i18n(`labels.${item.category}`) }}
                      </div>
                    </div>
                    <q-scroll-area
                      v-else
                      class="full-width"
                      style="height: 300px"
                    >
                      {{ item.detail }}
                    </q-scroll-area>
                  </q-card-section>
                </q-card>
              </q-expansion-item>
            </q-list>
          </q-scroll-area>
        </template>
      </q-splitter>
    </div>
  </q-page>
</template>

<style scoped></style>
