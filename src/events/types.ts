import { z } from "zod";

/**
 * WebSocket / Socket.IO event names for the Computer Agent protocol.
 */
export const WsEventSchema = z.enum([
  "REGISTER_DEVICE",
  "DEVICE_REGISTERED",
  "DEVICE_STATUS",
  "CAPTURE_SCREEN",
  "SCREEN_RESULT",
  "EXECUTE_ACTION",
  "ACTION_RESULT",
  "USER_MESSAGE",
  "AI_RESPONSE",
  "TASK_START",
  "TASK_UPDATE",
  "TASK_COMPLETED",
  "TASK_FAILED",
  "ASK_USER",
  "PING",
  "PONG",
  "ERROR",
]);

export type WsEvent = z.infer<typeof WsEventSchema>;

export const WS_EVENTS = WsEventSchema.options;

/**
 * Transport channel / namespace role.
 */
export const WsChannelSchema = z.enum(["web-client", "desktop-agent"]);
export type WsChannel = z.infer<typeof WsChannelSchema>;
