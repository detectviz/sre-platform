export type AutomationScriptParameter = {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select' | string;
  label?: string;
  required?: boolean;
  description?: string;
  defaultValue?: string | number | boolean;
  options?: Array<{ label: string; value: string }>;
};

export type AutomationScript = {
  id: string;
  name: string;
  language: string;
  category?: string;
  description?: string;
  owner?: string;
  repositoryUrl?: string;
  lastExecutedAt?: string;
  executionCount?: number;
  successRate?: number;
  isEnabled?: boolean;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  parameters?: AutomationScriptParameter[];
};

export type AutomationScheduleMode = 'simple' | 'advanced';

export type AutomationSchedule = {
  id: string;
  name: string;
  scriptId: string;
  scriptName?: string;
  cronExpression: string;
  mode: AutomationScheduleMode;
  frequency?: string;
  timezone?: string;
  isEnabled?: boolean;
  lastRunAt?: string;
  lastStatus?: 'success' | 'failed' | 'running' | 'pending';
  creator?: string;
  nextRunAt?: string;
};

export type AutomationExecutionStatus = 'success' | 'failed' | 'running' | 'cancelled';

export type AutomationExecution = {
  id: string;
  scriptId: string;
  scriptName?: string;
  status: AutomationExecutionStatus;
  triggerType: string;
  triggerMetadata?: Record<string, unknown>;
  startedAt?: string;
  finishedAt?: string;
  durationMs?: number;
  output?: string;
  operator?: string;
};

export type AutomationStats = {
  totalScripts: number;
  activeScripts: number;
  scheduledJobs: number;
  successRate24h: number;
  savedEngineerHours: number;
  trendingScripts: number;
};
