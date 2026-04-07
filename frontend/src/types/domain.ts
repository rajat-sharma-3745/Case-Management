export const CASE_STAGES = ["Filing", "Evidence", "Arguments", "Order Reserved"] as const;
export type CaseStage = (typeof CASE_STAGES)[number];

export type CaseDto = {
  _id: string;
  caseTitle: string;
  clientName: string;
  courtName: string;
  caseType: string;
  nextHearingDate: string;
  stage: CaseStage;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};

export const TASK_PRIORITIES = ["Low", "Medium", "High"] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const TASK_STATUSES = ["Pending", "Completed"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export type TaskDto = {
  _id: string;
  caseId: string;
  title: string;
  dueDate: string;
  ownerName: string;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type DashboardSummaryDto = {
  activeCases: number;
  hearingsNext7Days: number;
  tasksPending: number;
  tasksCompleted: number;
};
