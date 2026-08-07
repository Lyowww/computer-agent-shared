import { describe, expect, it } from "vitest";
import {
  WsEventSchema,
  WS_EVENTS,
  WsMessageSchema,
  ExecuteActionSchema,
  RegisterDeviceSchema,
  CaptureScreenSchema,
  ScreenResultSchema,
  ActionResultSchema,
  TaskStartSchema,
  TaskUpdateSchema,
  TaskCompletedSchema,
  TaskFailedSchema,
  AskUserEventSchema,
  PingSchema,
  PongSchema,
  ErrorEventSchema,
  UserMessageSchema,
  AiResponseSchema,
  DeviceRegisteredSchema,
  DeviceStatusEventSchema,
  createEnvelope,
  WsEnvelopeSchema,
} from "../src/index.js";

const TASK_ID = "11111111-1111-4111-8111-111111111111";
const DEVICE_ID = "22222222-2222-4222-8222-222222222222";

describe("WsEventSchema", () => {
  it("includes all required events", () => {
    expect(WS_EVENTS).toEqual([
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
  });

  it("rejects unknown events", () => {
    expect(WsEventSchema.safeParse("PAUSE").success).toBe(false);
  });
});

describe("ExecuteActionSchema", () => {
  it("matches the documented example shape", () => {
    const message = {
      event: "EXECUTE_ACTION",
      payload: {
        actionId: "act-1",
        type: "CLICK",
        params: { x: 100, y: 200 },
      },
    };
    const parsed = ExecuteActionSchema.parse(message);
    expect(parsed.event).toBe("EXECUTE_ACTION");
    expect(parsed.payload.type).toBe("CLICK");
    expect(parsed.payload.params).toEqual({ x: 100, y: 200 });
  });

  it("defaults params to empty object", () => {
    const parsed = ExecuteActionSchema.parse({
      event: "EXECUTE_ACTION",
      payload: { actionId: "a1", type: "SCREENSHOT" },
    });
    expect(parsed.payload.params).toEqual({});
  });
});

describe("device registration & status", () => {
  it("parses REGISTER_DEVICE", () => {
    expect(
      RegisterDeviceSchema.safeParse({
        event: "REGISTER_DEVICE",
        payload: {
          deviceToken: "tokensecretvalue12",
          deviceName: "MacBook",
          os: "darwin",
        },
      }).success,
    ).toBe(true);
  });

  it("parses DEVICE_REGISTERED and DEVICE_STATUS", () => {
    expect(
      DeviceRegisteredSchema.safeParse({
        event: "DEVICE_REGISTERED",
        payload: {
          deviceId: DEVICE_ID,
          name: "MacBook",
          os: "darwin",
          status: "ONLINE",
        },
      }).success,
    ).toBe(true);

    expect(
      DeviceStatusEventSchema.safeParse({
        event: "DEVICE_STATUS",
        payload: {
          deviceId: DEVICE_ID,
          status: "PAUSED",
          lastSeenAt: "2026-08-08T00:00:00.000Z",
        },
      }).success,
    ).toBe(true);
  });
});

describe("screen capture flow", () => {
  it("parses CAPTURE_SCREEN and SCREEN_RESULT", () => {
    expect(
      CaptureScreenSchema.safeParse({
        event: "CAPTURE_SCREEN",
        payload: { requestId: "req-1", quality: 80, taskId: TASK_ID },
      }).success,
    ).toBe(true);

    expect(
      ScreenResultSchema.safeParse({
        event: "SCREEN_RESULT",
        payload: {
          requestId: "req-1",
          width: 1920,
          height: 1080,
          image: "base64data",
          mimeType: "image/png",
        },
      }).success,
    ).toBe(true);
  });
});

describe("action result & messaging", () => {
  it("parses ACTION_RESULT", () => {
    expect(
      ActionResultSchema.safeParse({
        event: "ACTION_RESULT",
        payload: {
          actionId: "act-1",
          taskId: TASK_ID,
          success: true,
          result: { ok: true },
        },
      }).success,
    ).toBe(true);
  });

  it("parses USER_MESSAGE and AI_RESPONSE", () => {
    expect(
      UserMessageSchema.safeParse({
        event: "USER_MESSAGE",
        payload: { content: "Open Chrome", deviceId: DEVICE_ID },
      }).success,
    ).toBe(true);

    expect(
      AiResponseSchema.safeParse({
        event: "AI_RESPONSE",
        payload: {
          taskId: TASK_ID,
          content: "Opening Chrome",
          actions: [{ type: "OPEN_APP", params: { app: "Chrome" } }],
        },
      }).success,
    ).toBe(true);
  });
});

describe("task lifecycle events", () => {
  it("parses start/update/completed/failed", () => {
    expect(
      TaskStartSchema.safeParse({
        event: "TASK_START",
        payload: {
          taskId: TASK_ID,
          instruction: "Do something",
          deviceId: DEVICE_ID,
        },
      }).success,
    ).toBe(true);

    expect(
      TaskUpdateSchema.safeParse({
        event: "TASK_UPDATE",
        payload: {
          taskId: TASK_ID,
          status: "WAITING_FOR_ACTION",
          iteration: 2,
        },
      }).success,
    ).toBe(true);

    expect(
      TaskCompletedSchema.safeParse({
        event: "TASK_COMPLETED",
        payload: { taskId: TASK_ID, status: "COMPLETED", message: "done" },
      }).success,
    ).toBe(true);

    expect(
      TaskFailedSchema.safeParse({
        event: "TASK_FAILED",
        payload: { taskId: TASK_ID, status: "FAILED", message: "timeout" },
      }).success,
    ).toBe(true);
  });
});

describe("ASK_USER / PING / PONG / ERROR", () => {
  it("parses ASK_USER event", () => {
    expect(
      AskUserEventSchema.safeParse({
        event: "ASK_USER",
        payload: {
          taskId: TASK_ID,
          question: "Which folder?",
          reason: "ambiguous path",
        },
      }).success,
    ).toBe(true);
  });

  it("parses PING and PONG with default payloads", () => {
    expect(PingSchema.parse({ event: "PING" }).payload).toEqual({});
    expect(PongSchema.parse({ event: "PONG" }).payload).toEqual({});
  });

  it("parses ERROR", () => {
    expect(
      ErrorEventSchema.safeParse({
        event: "ERROR",
        payload: { code: "DEVICE_OFFLINE", message: "Device is offline" },
      }).success,
    ).toBe(true);
  });
});

describe("WsMessageSchema", () => {
  it("discriminates on event", () => {
    const parsed = WsMessageSchema.parse({
      event: "EXECUTE_ACTION",
      payload: { actionId: "a", type: "WAIT", params: { ms: 10 } },
    });
    expect(parsed.event).toBe("EXECUTE_ACTION");
  });

  it("rejects invalid combinations", () => {
    expect(
      WsMessageSchema.safeParse({
        event: "TASK_COMPLETED",
        payload: { taskId: TASK_ID, status: "FAILED", message: "x" },
      }).success,
    ).toBe(false);
  });
});

describe("envelope", () => {
  it("creates and validates envelopes", () => {
    const envelope = createEnvelope("PING", { nonce: "abcdefgh" });
    expect(envelope.event).toBe("PING");
    expect(envelope.timestamp).toEqual(expect.any(Number));
    expect(WsEnvelopeSchema.safeParse(envelope).success).toBe(true);
  });
});
