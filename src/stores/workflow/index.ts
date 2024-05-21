import { defineStore } from 'pinia';
import { ref } from 'vue';

import { agentStream } from 'boot/axios';
import { StepInfo, Workflow } from 'stores/workflow/types';

const defaultStepInfos: StepInfo[] = [
  {
    category: 'staticCheck',
    name: 'staticCheck',
    status: 'pending',
    detail: 'staticCheck',
  },
  {
    category: 'compileCode',
    name: 'compileCode',
    status: 'pending',
    detail: 'compileCode',
  },
  {
    category: 'agentAudit',
    name: 'agentAudit',
    status: 'pending',
    detail: 'agentAudit',
  },
  {
    category: 'deployArtifact',
    name: 'deployArtifact',
    status: 'pending',
    detail: 'deployArtifact',
  },
];

export const useWorkflowStore = defineStore('workflow', () => {
  const workflows = ref<Workflow[]>([]);

  const createWorkflow = async (
    projectPath: string,
    commitMessage: string,
    userId: string,
  ) =>
    new Promise(async (resolve) => {
      let currentWorkflow: Workflow | undefined;
      await agentStream(projectPath, ({ id, data }) => {
        if (!workflows.value.find((workflow) => workflow.id === id)) {
          workflows.value.push({
            id,
            name: commitMessage.split(/\r\n?/)[0],
            creator: userId,
            status: 'pending',
            steps: defaultStepInfos,
          });
          currentWorkflow = workflows.value[workflows.value.length - 1];
          resolve(id);
        }
        if (data && currentWorkflow) {
          currentWorkflow.status = 'running';
          data.forEach((dataStepInfo) => {
            const step = currentWorkflow!.steps.find(
              (step) => step.category === dataStepInfo.category,
            );
            if (step) {
              step.name = dataStepInfo.name;
              step.status = dataStepInfo.status;
              step.detail = dataStepInfo.detail;
            }
          });
          if (
            !currentWorkflow.steps.find((step) => step.status === 'running')
          ) {
            const currentStep = currentWorkflow.steps.find(
              (step) => step.status === 'pending',
            );
            if (currentStep) {
              currentStep.status = 'running';
            }
          }
        }
      });

      if (currentWorkflow) {
        currentWorkflow.steps.forEach((step) => {
          if (step.status === 'pending' || step.status === 'running') {
            step.status = 'skipped';
          }
        });
        if (currentWorkflow.steps.find((step) => step.status === 'failure')) {
          currentWorkflow.status = 'failure';
        } else {
          currentWorkflow.status = 'success';
        }
      }
    });

  const deleteWorkflow = (workflowId: string) => {
    const index = workflows.value.findIndex(
      (workflow) => workflow.id === workflowId,
    );
    if (index !== -1) {
      workflows.value.splice(index, 1);
    }
  };

  return {
    workflows,
    createWorkflow,
    deleteWorkflow,
  };
});
