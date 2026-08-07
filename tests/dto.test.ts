import { describe, expect, it } from "vitest";
import {
  LoginRequestSchema,
  RegisterRequestSchema,
  CreateDeviceRequestSchema,
  CreateTaskRequestSchema,
  DeviceDtoSchema,
  TaskDtoSchema,
  PlanRequestSchema,
  PlanResponseSchema,
  AiPlanResponseSchema,
  agentStatusToWire,
  wireStatusToAgent,
} from "../src/index.js";

const DEVICE_ID = "22222222-2222-4222-8222-222222222222";
const TASK_ID = "11111111-1111-4111-8111-111111111111";

describe("auth DTOs", () => {
  it("validates login and register", () => {
    expect(
      LoginRequestSchema.safeParse({
        email: "user@example.com",
        password: "password1",
      }).success,
    ).toBe(true);

    expect(
      RegisterRequestSchema.safeParse({
        email: "user@example.com",
        password: "short",
      }).success,
    ).toBe(false);
  });
});

describe("device & task DTOs", () => {
  it("validates create device / task requests", () => {
    expect(
      CreateDeviceRequestSchema.safeParse({
        name: "Office Mac",
        os: "darwin",
      }).success,
    ).toBe(true);

    expect(
      CreateTaskRequestSchema.safeParse({
        instruction: "Open Notes and create a file",
        deviceId: DEVICE_ID,
        maxIterations: 30,
      }).success,
    ).toBe(true);
  });

  it("validates response DTOs", () => {
    expect(
      DeviceDtoSchema.safeParse({
        id: DEVICE_ID,
        name: "Office Mac",
        os: "darwin",
        status: "ONLINE",
      }).success,
    ).toBe(true);

    expect(
      TaskDtoSchema.safeParse({
        id: TASK_ID,
        instruction: "Do work",
        deviceId: DEVICE_ID,
        status: "CREATED",
      }).success,
    ).toBe(true);
  });
});

describe("plan HTTP DTOs", () => {
  it("validates plan request", () => {
    const parsed = PlanRequestSchema.parse({
      taskId: TASK_ID,
      userInstruction: "Click the blue button",
      screenshot: {
        width: 100,
        height: 100,
        image: "abc",
        mimeType: "image/png",
      },
    });
    expect(parsed.previousActions).toEqual([]);
  });

  it("validates backend wire plan response", () => {
    expect(
      PlanResponseSchema.safeParse({
        taskId: TASK_ID,
        status: "continue",
        message: "Clicking",
        actions: [{ type: "CLICK", params: { x: 1, y: 2 } }],
      }).success,
    ).toBe(true);
  });

  it("validates AI plan response shape", () => {
    expect(
      AiPlanResponseSchema.safeParse({
        status: "ACTION_REQUIRED",
        reasoning_summary: "Need to click submit",
        actions: [{ type: "CLICK", params: { x: 10, y: 20 } }],
        message: "Clicking submit",
      }).success,
    ).toBe(true);
  });

  it("maps agent status ↔ wire status", () => {
    expect(agentStatusToWire("ACTION_REQUIRED")).toBe("continue");
    expect(agentStatusToWire("NEEDS_USER_INPUT")).toBe("need_user");
    expect(wireStatusToAgent("completed")).toBe("COMPLETED");
    expect(wireStatusToAgent("failed")).toBe("FAILED");
  });
});
