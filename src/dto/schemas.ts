import { z } from "zod";
import { DeviceOsSchema } from "../statuses/device.js";
import { TaskStatusSchema } from "../statuses/task.js";
import { DeviceStatusSchema } from "../statuses/device.js";
import { LooseActionSchema, ComputerActionSchema } from "../actions/schemas.js";
import { MimeTypeSchema } from "../events/schemas.js";

/** --- Auth --- */

export const LoginRequestSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(8).max(128),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const RegisterRequestSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(120).optional(),
});
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

export const AuthTokenResponseSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1).optional(),
  expiresIn: z.number().int().positive().optional(),
});
export type AuthTokenResponse = z.infer<typeof AuthTokenResponseSchema>;

/** --- Devices --- */

export const CreateDeviceRequestSchema = z.object({
  name: z.string().min(1).max(120),
  os: DeviceOsSchema,
});
export type CreateDeviceRequest = z.infer<typeof CreateDeviceRequestSchema>;

export const DeviceDtoSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(120),
  os: DeviceOsSchema,
  status: DeviceStatusSchema,
  lastSeenAt: z.string().datetime().nullable().optional(),
  createdAt: z.string().datetime().optional(),
});
export type DeviceDto = z.infer<typeof DeviceDtoSchema>;

export const CreateDeviceResponseSchema = DeviceDtoSchema.extend({
  deviceToken: z.string().min(16).max(256),
});
export type CreateDeviceResponse = z.infer<typeof CreateDeviceResponseSchema>;

/** --- Tasks --- */

export const CreateTaskRequestSchema = z.object({
  instruction: z.string().min(1).max(4000),
  deviceId: z.string().uuid(),
  maxIterations: z.number().int().min(1).max(200).optional(),
});
export type CreateTaskRequest = z.infer<typeof CreateTaskRequestSchema>;

export const TaskDtoSchema = z.object({
  id: z.string().uuid(),
  instruction: z.string().min(1).max(4000),
  deviceId: z.string().uuid(),
  status: TaskStatusSchema,
  iteration: z.number().int().min(0).optional(),
  maxIterations: z.number().int().min(1).max(200).optional(),
  message: z.string().max(8000).nullable().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});
export type TaskDto = z.infer<typeof TaskDtoSchema>;

/** --- AI plan HTTP contract (backend ↔ AI service) --- */

export const ScreenshotDtoSchema = z.object({
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  image: z.string().min(1),
  mimeType: MimeTypeSchema.optional(),
});
export type ScreenshotDto = z.infer<typeof ScreenshotDtoSchema>;

export const PlanRequestSchema = z.object({
  taskId: z.string().min(1),
  userInstruction: z.string().min(1).max(4000),
  screenshot: ScreenshotDtoSchema,
  previousActions: z.array(LooseActionSchema).max(100).default([]),
});
export type PlanRequest = z.infer<typeof PlanRequestSchema>;

/**
 * Wire status returned by the AI planning service to the backend.
 */
export const PlanWireStatusSchema = z.enum([
  "continue",
  "completed",
  "failed",
  "need_user",
]);
export type PlanWireStatus = z.infer<typeof PlanWireStatusSchema>;

/**
 * Semantic agent status used inside the AI package / higher-level APIs.
 */
export const AgentStatusSchema = z.enum([
  "ACTION_REQUIRED",
  "COMPLETED",
  "NEEDS_USER_INPUT",
  "FAILED",
]);
export type AgentStatus = z.infer<typeof AgentStatusSchema>;

export const PlanResponseSchema = z.object({
  taskId: z.string().min(1),
  status: PlanWireStatusSchema.optional(),
  message: z.string().max(8000).optional(),
  actions: z.array(LooseActionSchema).max(20).default([]),
});
export type PlanResponse = z.infer<typeof PlanResponseSchema>;

export const AiPlanResponseSchema = z.object({
  status: AgentStatusSchema,
  reasoning_summary: z.string().min(1).max(1000),
  actions: z.array(ComputerActionSchema).max(10),
  message: z.string().min(1).max(4000),
});
export type AiPlanResponse = z.infer<typeof AiPlanResponseSchema>;

const AGENT_TO_WIRE: Record<AgentStatus, PlanWireStatus> = {
  ACTION_REQUIRED: "continue",
  COMPLETED: "completed",
  NEEDS_USER_INPUT: "need_user",
  FAILED: "failed",
};

const WIRE_TO_AGENT: Record<PlanWireStatus, AgentStatus> = {
  continue: "ACTION_REQUIRED",
  completed: "COMPLETED",
  need_user: "NEEDS_USER_INPUT",
  failed: "FAILED",
};

export function agentStatusToWire(status: AgentStatus): PlanWireStatus {
  return AGENT_TO_WIRE[status];
}

export function wireStatusToAgent(status: PlanWireStatus): AgentStatus {
  return WIRE_TO_AGENT[status];
}
