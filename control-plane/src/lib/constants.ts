import type { BrokerInstanceStatus, ProvisioningJobStatus, ProvisioningStep } from "@/lib/types/database";

export const BROKER_STATUS_LABELS: Record<BrokerInstanceStatus, string> = {
  provisioning: "Provisioning",
  active: "Active",
  suspended: "Suspended",
  cancelled: "Cancelled",
};

export const BROKER_STATUS_CLASSES: Record<BrokerInstanceStatus, string> = {
  provisioning: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-900",
  active: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900",
  suspended: "bg-slate-200 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  cancelled: "bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-900",
};

export const PROVISIONING_STEP_LABELS: Record<ProvisioningStep, string> = {
  create_project: "Create Supabase project",
  run_migrations: "Run tenant migrations",
  seed_defaults: "Seed default data",
  deploy_frontend: "Deploy frontend",
  assign_domain: "Assign domain",
  done: "Finish",
};

export const PROVISIONING_JOB_STATUS_LABELS: Record<ProvisioningJobStatus, string> = {
  pending: "Pending",
  running: "Running",
  done: "Done",
  failed: "Failed",
};
