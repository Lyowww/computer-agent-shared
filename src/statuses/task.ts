import { z } from "zod";

/**
 * Lifecycle status of a computer-control task.
 */
export const TaskStatusSchema = z.enum([
  "CREATED",
  "RUNNING",
  "WAITING_FOR_SCREEN",
  "WAITING_FOR_ACTION",
  "WAITING_FOR_USER",
  "COMPLETED",
  "FAILED",
  "CANCELLED",
]);

export type TaskStatus = z.infer<typeof TaskStatusSchema>;

export const TASK_STATUSES = TaskStatusSchema.options;

export const TerminalTaskStatuses = [
  "COMPLETED",
  "FAILED",
  "CANCELLED",
] as const satisfies readonly TaskStatus[];

export type TerminalTaskStatus = (typeof TerminalTaskStatuses)[number];

export function isTerminalTaskStatus(status: TaskStatus): status is TerminalTaskStatus {
  return (TerminalTaskStatuses as readonly string[]).includes(status);
}
