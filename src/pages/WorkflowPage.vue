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
    status: 'running',
    steps: [
      { name: '上传代码', status: 'success', details: '上传成功' },
      {
        name: '静态CA Agent',
        status: 'success',
        details:
          '开始静态检查...\nCA Warning: xxxxx\n静态检查未通过...\n开始自动修复...\n自动修复成功',
      },
      { name: '版本编译 Agent', status: 'running', details: '开始执行编译脚本...\nLog: xxxxx' },
      { name: '自动部署 Agent', status: 'pending' },
    ],
    duration: 123456,
  },
  {
    id: 2,
    name: 'Workflow 2',
    trigger: 'g29624',
    timestamp: Date.now(),
    status: 'failed',
    steps: [
      { name: '上传代码', status: 'success', details: '上传成功' },
      {
        name: '静态CA Agent',
        status: 'failed',
        details:
          '开始静态检查...\nCA Error: xxxxx\n静态检查未通过...\n开始自动修复...\n自动修复失败',
      },
      { name: '版本编译 Agent', status: 'skipped' },
      { name: '自动部署 Agent', status: 'skipped' },
    ],
    duration: 123456,
  },
];

const selectedIndex = ref(0);
const splitPercentage = ref(50);
</script>

<template>
  <q-page class="flex">
    <div class="full-width" style="height: calc(100vh - 83px)">
      <q-splitter class="full-height" horizontal v-model="splitPercentage">
        <template v-slot:before>
          <q-scroll-area class="full-height full-width">
            <q-list separator>
              <q-item
                v-for="(item, index) in pseudoWorkflows"
                :key="index"
                :active="selectedIndex === index"
                active-class="bg-grey-4 text-black"
                clickable
                @click="selectedIndex = index"
              >
                <q-item-section avatar>
                  <q-icon
                    v-if="item.status === 'aborted'"
                    name="mdi-alert-circle"
                    color="grey"
                    size="2rem"
                  />
                  <q-icon
                    v-else-if="item.status === 'failed'"
                    name="mdi-close-circle"
                    color="negative"
                    size="2rem"
                  />
                  <q-spinner-clock
                    v-else-if="item.status === 'pending'"
                    color="primary"
                    size="1.75rem"
                    style="margin-left: 0.1rem"
                  />
                  <div
                    v-else-if="item.status === 'running'"
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
                    v-else-if="item.status === 'success'"
                    name="mdi-check-circle"
                    color="positive"
                    size="2rem"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label>
                    {{ item.name }}
                  </q-item-label>
                  <q-item-label caption>
                    Started by {{ item.trigger }}
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
                v-for="(item, index) in pseudoWorkflows[selectedIndex]
                  .steps"
                :key="index"
                expand-separator
                :icon="
                  item.status === 'aborted'
                    ? 'mdi-alert-circle'
                    : item.status === 'failed'
                      ? 'mdi-close-circle'
                      : item.status === 'pending'
                        ? 'mdi-clock-outline'
                        : item.status === 'running'
                          ? 'mdi-circle-slice-8'
                          : item.status === 'skipped'
                            ? 'mdi-cancel'
                            : 'mdi-check-circle'
                "
                :label="item.name"
                :model-value="item.status === 'running'"
              >
                <q-card>
                  <q-card-section style="white-space: pre">
                    {{ item.details }}
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
