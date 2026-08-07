import { z } from "zod";
import { ActionTypeSchema, LooseActionSchema } from "../actions/schemas.js";
import { DeviceOsSchema, DeviceStatusSchema } from "../statuses/device.js";
import { TaskStatusSchema } from "../statuses/task.js";

const IdSchema = z.string().min(1).max(128);
const UuidSchema = z.string().uuid();

export const MimeTypeSchema = z.enum([
  "image/png",
  "image/jpeg",
  "image/webp",
]);
export type MimeType = z.infer<typeof MimeTypeSchema>;

/** --- Payload schemas --- */

export const RegisterDevicePayloadSchema = z.object({
  deviceToken: z.string().min(16).max(256),
  deviceName: z.string().min(1).max(120),
  os: DeviceOsSchema,
});
export type RegisterDevicePayload = z.infer<typeof RegisterDevicePayloadSchema>;

export const DeviceRegisteredPayloadSchema = z.object({
  deviceId: UuidSchema,
  name: z.string().min(1).max(120),
  os: DeviceOsSchema,
  status: DeviceStatusSchema,
});
export type DeviceRegisteredPayload = z.infer<
  typeof DeviceRegisteredPayloadSchema
>;

export const DeviceStatusPayloadSchema = z.object({
  deviceId: UuidSchema,
  status: DeviceStatusSchema,
  lastSeenAt: z.string().datetime().optional(),
  name: z.string().min(1).max(120).optional(),
  os: DeviceOsSchema.optional(),
  message: z.string().max(2000).optional(),
});
export type DeviceStatusPayload = z.infer<typeof DeviceStatusPayloadSchema>;

export const CaptureScreenPayloadSchema = z.object({
  requestId: IdSchema,
  quality: z.number().int().min(1).max(100).optional(),
  maxWidth: z.number().int().positive().max(7680).optional(),
  taskId: UuidSchema.optional(),
});
export type CaptureScreenPayload = z.infer<typeof CaptureScreenPayloadSchema>;

export const ScreenResultPayloadSchema = z.object({
  requestId: IdSchema,
  taskId: UuidSchema.optional(),
  width: z.number().int().positive().max(10_000),
  height: z.number().int().positive().max(10_000),
  image: z.string().min(1).max(15_000_000),
  mimeType: MimeTypeSchema.optional(),
});
export type ScreenResultPayload = z.infer<typeof ScreenResultPayloadSchema>;

export const ExecuteActionPayloadSchema = z.object({
  actionId: IdSchema,
  taskId: UuidSchema.optional(),
  type: ActionTypeSchema,
  params: z.record(z.unknown()).default({}),
});
export type ExecuteActionPayload = z.infer<typeof ExecuteActionPayloadSchema>;

export const ActionResultPayloadSchema = z.object({
  actionId: IdSchema,
  taskId: UuidSchema.optional(),
  success: z.boolean(),
  result: z.record(z.unknown()).optional(),
  error: z.string().max(2000).optional(),
});
export type ActionResultPayload = z.infer<typeof ActionResultPayloadSchema>;

export const UserMessagePayloadSchema = z.object({
  requestId: IdSchema.optional(),
  taskId: UuidSchema.optional(),
  content: z.string().min(1).max(4000),
  deviceId: UuidSchema.optional(),
});
export type UserMessagePayload = z.infer<typeof UserMessagePayloadSchema>;

export const AiResponsePayloadSchema = z.object({
  taskId: UuidSchema,
  content: z.string().min(1).max(8000),
  actions: z.array(LooseActionSchema).max(20).optional(),
});
export type AiResponsePayload = z.infer<typeof AiResponsePayloadSchema>;

export const TaskStartPayloadSchema = z.object({
  taskId: UuidSchema,
  instruction: z.string().min(1).max(4000),
  deviceId: UuidSchema,
});
export type TaskStartPayload = z.infer<typeof TaskStartPayloadSchema>;

export const TaskUpdatePayloadSchema = z.object({
  taskId: UuidSchema,
  status: TaskStatusSchema,
  iteration: z.number().int().min(0).optional(),
  message: z.string().max(4000).optional(),
});
export type TaskUpdatePayload = z.infer<typeof TaskUpdatePayloadSchema>;

export const TaskCompletedPayloadSchema = z.object({
  taskId: UuidSchema,
  status: z.literal("COMPLETED"),
  message: z.string().max(4000).optional(),
});
export type TaskCompletedPayload = z.infer<typeof TaskCompletedPayloadSchema>;

export const TaskFailedPayloadSchema = z.object({
  taskId: UuidSchema,
  status: z.literal("FAILED"),
  message: z.string().min(1).max(4000),
});
export type TaskFailedPayload = z.infer<typeof TaskFailedPayloadSchema>;

export const AskUserEventPayloadSchema = z.object({
  taskId: UuidSchema,
  question: z.string().min(1).max(2000),
  reason: z.string().max(1000).optional(),
  requestId: IdSchema.optional(),
});
export type AskUserEventPayload = z.infer<typeof AskUserEventPayloadSchema>;

export const PingPayloadSchema = z.object({
  requestId: IdSchema.optional(),
  nonce: z.string().min(8).max(128).optional(),
});
export type PingPayload = z.infer<typeof PingPayloadSchema>;

export const PongPayloadSchema = z.object({
  requestId: IdSchema.optional(),
  serverTime: z.number().int().nonnegative().optional(),
  nonce: z.string().min(8).max(128).optional(),
});
export type PongPayload = z.infer<typeof PongPayloadSchema>;

export const ErrorPayloadSchema = z.object({
  code: z.string().min(1).max(64),
  message: z.string().min(1).max(4000),
  details: z.unknown().optional(),
  requestId: IdSchema.optional(),
  taskId: UuidSchema.optional(),
});
export type ErrorPayload = z.infer<typeof ErrorPayloadSchema>;

/** --- Full event message schemas (event + payload) --- */

export const RegisterDeviceSchema = z.object({
  event: z.literal("REGISTER_DEVICE"),
  payload: RegisterDevicePayloadSchema,
});

export const DeviceRegisteredSchema = z.object({
  event: z.literal("DEVICE_REGISTERED"),
  payload: DeviceRegisteredPayloadSchema,
});

export const DeviceStatusEventSchema = z.object({
  event: z.literal("DEVICE_STATUS"),
  payload: DeviceStatusPayloadSchema,
});

export const CaptureScreenSchema = z.object({
  event: z.literal("CAPTURE_SCREEN"),
  payload: CaptureScreenPayloadSchema,
});

export const ScreenResultSchema = z.object({
  event: z.literal("SCREEN_RESULT"),
  payload: ScreenResultPayloadSchema,
});

export const ExecuteActionSchema = z.object({
  event: z.literal("EXECUTE_ACTION"),
  payload: ExecuteActionPayloadSchema,
});

export const ActionResultSchema = z.object({
  event: z.literal("ACTION_RESULT"),
  payload: ActionResultPayloadSchema,
});

export const UserMessageSchema = z.object({
  event: z.literal("USER_MESSAGE"),
  payload: UserMessagePayloadSchema,
});

export const AiResponseSchema = z.object({
  event: z.literal("AI_RESPONSE"),
  payload: AiResponsePayloadSchema,
});

export const TaskStartSchema = z.object({
  event: z.literal("TASK_START"),
  payload: TaskStartPayloadSchema,
});

export const TaskUpdateSchema = z.object({
  event: z.literal("TASK_UPDATE"),
  payload: TaskUpdatePayloadSchema,
});

export const TaskCompletedSchema = z.object({
  event: z.literal("TASK_COMPLETED"),
  payload: TaskCompletedPayloadSchema,
});

export const TaskFailedSchema = z.object({
  event: z.literal("TASK_FAILED"),
  payload: TaskFailedPayloadSchema,
});

export const AskUserEventSchema = z.object({
  event: z.literal("ASK_USER"),
  payload: AskUserEventPayloadSchema,
});

export const PingSchema = z.object({
  event: z.literal("PING"),
  payload: PingPayloadSchema.default({}),
});

export const PongSchema = z.object({
  event: z.literal("PONG"),
  payload: PongPayloadSchema.default({}),
});

export const ErrorEventSchema = z.object({
  event: z.literal("ERROR"),
  payload: ErrorPayloadSchema,
});

/**
 * Discriminated union of all protocol WebSocket messages.
 */
export const WsMessageSchema = z.discriminatedUnion("event", [
  RegisterDeviceSchema,
  DeviceRegisteredSchema,
  DeviceStatusEventSchema,
  CaptureScreenSchema,
  ScreenResultSchema,
  ExecuteActionSchema,
  ActionResultSchema,
  UserMessageSchema,
  AiResponseSchema,
  TaskStartSchema,
  TaskUpdateSchema,
  TaskCompletedSchema,
  TaskFailedSchema,
  AskUserEventSchema,
  PingSchema,
  PongSchema,
  ErrorEventSchema,
]);

export type WsMessage = z.infer<typeof WsMessageSchema>;
export type RegisterDeviceMessage = z.infer<typeof RegisterDeviceSchema>;
export type DeviceRegisteredMessage = z.infer<typeof DeviceRegisteredSchema>;
export type DeviceStatusMessage = z.infer<typeof DeviceStatusEventSchema>;
export type CaptureScreenMessage = z.infer<typeof CaptureScreenSchema>;
export type ScreenResultMessage = z.infer<typeof ScreenResultSchema>;
export type ExecuteActionMessage = z.infer<typeof ExecuteActionSchema>;
export type ActionResultMessage = z.infer<typeof ActionResultSchema>;
export type UserMessageMessage = z.infer<typeof UserMessageSchema>;
export type AiResponseMessage = z.infer<typeof AiResponseSchema>;
export type TaskStartMessage = z.infer<typeof TaskStartSchema>;
export type TaskUpdateMessage = z.infer<typeof TaskUpdateSchema>;
export type TaskCompletedMessage = z.infer<typeof TaskCompletedSchema>;
export type TaskFailedMessage = z.infer<typeof TaskFailedSchema>;
export type AskUserMessage = z.infer<typeof AskUserEventSchema>;
export type PingMessage = z.infer<typeof PingSchema>;
export type PongMessage = z.infer<typeof PongSchema>;
export type ErrorMessage = z.infer<typeof ErrorEventSchema>;
