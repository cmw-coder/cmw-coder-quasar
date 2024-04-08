<script setup lang="ts">
import { ref } from 'vue';

interface StepInfo {
  name: string;
  status: 'aborted' | 'failed' | 'pending' | 'running' | 'skipped' | 'success';
  details?: string;
}

interface WorkflowInfo {
  id: number;
  name: string;
  trigger: string;
  timestamp: number;
  status: 'aborted' | 'failed' | 'pending' | 'running' | 'success';
  steps: StepInfo[];
  duration?: number;
}

const pseudoWorkflows: WorkflowInfo[] = [
  {
    id: 1,
    name: 'Workflow 1',
    trigger: 'g29624',
    timestamp: Date.now(),
    status: 'pending',
    steps: [
      { name: 'Step 1', status: 'pending' },
      { name: 'Step 2', status: 'pending' },
      { name: 'Step 3', status: 'pending' },
      { name: 'Step 4', status: 'pending' },
      { name: 'Step 5', status: 'pending' },
    ],
  },
  {
    id: 2,
    name: 'Workflow 2',
    trigger: 'g29624',
    timestamp: Date.now(),
    status: 'running',
    steps: [
      { name: 'Step 1', status: 'success', details: 'Success: Step 1'},
      { name: 'Step 2', status: 'skipped', details: 'Skipped: Step 2'},
      { name: 'Step 3', status: 'running', details: 'Running: Step 3'},
      { name: 'Step 4', status: 'pending' },
      { name: 'Step 5', status: 'pending' },
    ],
  },
  {
    id: 3,
    name: 'Workflow 3',
    trigger: 'g29624',
    timestamp: Date.now(),
    status: 'success',
    steps: [
      { name: 'Step 1', status: 'success' },
      { name: 'Step 2', status: 'success' },
      { name: 'Step 3', status: 'success' },
      { name: 'Step 4', status: 'success' },
      { name: 'Step 5', status: 'success' },
    ],
    duration: 123456,
  },
  {
    id: 4,
    name: 'Workflow 4',
    trigger: 'g29624',
    timestamp: Date.now(),
    status: 'aborted',
    steps: [
      { name: 'Step 1', status: 'success' },
      { name: 'Step 2', status: 'success' },
      { name: 'Step 3', status: 'success' },
      { name: 'Step 4', status: 'success' },
      { name: 'Step 5', status: 'success' },
    ],
    duration: 123456,
  },
  {
    id: 5,
    name: 'Workflow 5',
    trigger: 'g29624',
    timestamp: Date.now(),
    status: 'failed',
    steps: [
      { name: 'Step 1', status: 'success' },
      { name: 'Step 2', status: 'success' },
      {
        name: 'Step 3',
        status: 'failed',
        details: 'Error: Something went wrong',
      },
      { name: 'Step 4', status: 'aborted' },
      { name: 'Step 5', status: 'pending' },
    ],
    duration: 123456,
  },
];

const selectedWorkflowIndex = ref(0);
const splitPercent = ref(50);
</script>

<template>
  <q-page class="flex">
    <div class="full-width" style="height: calc(100vh - 83px)">
      <q-splitter class="full-height" horizontal v-model="splitPercent">
        <template v-slot:before>
          <q-scroll-area class="full-height full-width">
            <q-list separator>
              <q-item
                v-for="(workflow, index) in pseudoWorkflows"
                :key="index"
                :active="selectedWorkflowIndex === index"
                active-class="bg-grey-4 text-black"
                clickable
                @click="selectedWorkflowIndex = index"
              >
                <q-item-section avatar>
                  <q-icon
                    v-if="workflow.status === 'aborted'"
                    name="mdi-alert-circle"
                    color="grey"
                    size="2rem"
                  />
                  <q-icon
                    v-else-if="workflow.status === 'failed'"
                    name="mdi-close-circle"
                    color="negative"
                    size="2rem"
                  />
                  <q-spinner-clock
                    v-else-if="workflow.status === 'pending'"
                    color="primary"
                    size="1.75rem"
                    style="margin-left: 0.1rem"
                  />
                  <div
                    v-else-if="workflow.status === 'running'"
                    class="row justify-center items-center"
                    style="margin-left: 0.1rem"
                  >
                    <q-spinner-oval color="amber" size="1.75rem" />
                    <q-icon
                      class="absolute"
                      color="amber"
                      name="circle"
                      size="xs"
                    />
                  </div>
                  <q-icon
                    v-else-if="workflow.status === 'success'"
                    name="mdi-check-circle"
                    color="positive"
                    size="2rem"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label>
                    {{ workflow.name }}
                  </q-item-label>
                  <q-item-label caption
                    >Started by {{ workflow.trigger }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn dense flat icon="mdi-dots-horizontal" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-scroll-area>
        </template>
        <template v-slot:after>
          <q-scroll-area class="full-height full-width">
            <q-list separator>
              <q-expansion-item
                expand-separator
                icon="perm_identity"
                label="Account settings"
                caption="John Doe"
              >
                <q-card>
                  <q-card-section>
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quidem, eius reprehenderit eos corrupti
                    commodi magni quaerat ex numquam, dolorum officiis modi facere maiores architecto suscipit iste
                    eveniet doloribus ullam aliquid.
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
