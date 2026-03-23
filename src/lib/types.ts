export interface RequestError {
  step: string;
  message: string;
  stack?: string;
}

export interface RequestItem {
  requestId: string;
  type: string;
  step: string;
  organization: string;
  deploymentStage: string;
  environment: string;
  automated: boolean;
  startedAt: string;
  duration: number;
  countryCode: string;
  documentType: string;
  companyId: string;
  failedStep?: string;
  error?: RequestError;
  debugUrl?: string;
  ttl: number;
}

export type StepStatus =
  | "completed"
  | "failed"
  | "in-progress"
  | "pending"
  | "cancelled";

export interface RequestFilters {
  type?: string;
  step?: string;
  organization?: string;
  countryCode?: string;
  dateFrom?: string;
  dateTo?: string;
}
