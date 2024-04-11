export interface StepInfo {
  category: 'agentAudit' | 'compileCode' | 'deployArtifact' | 'staticCheck';
  name: string;
  status: 'failure' | 'pending' | 'running' | 'skipped' | 'success';
  detail: string;
}

export interface Workflow {
  id: string;
  name: string;
  creator: string;
  status: 'failure' | 'pending' | 'running' | 'success'
  steps: StepInfo[];
}
