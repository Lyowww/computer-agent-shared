import { describe, expect, it } from "vitest";
import {
  TaskStatusSchema,
  TASK_STATUSES,
  DeviceStatusSchema,
  DEVICE_STATUSES,
  DeviceOsSchema,
  isTerminalTaskStatus,
} from "../src/index.js";

describe("TaskStatusSchema", () => {
  it("includes all required statuses", () => {
    expect(TASK_STATUSES).toEqual([
      "CREATED",
      "RUNNING",
      "WAITING_FOR_SCREEN",
      "WAITING_FOR_ACTION",
      "WAITING_FOR_USER",
      "COMPLETED",
      "FAILED",
      "CANCELLED",
    ]);
  });

  it("identifies terminal statuses", () => {
    expect(isTerminalTaskStatus("COMPLETED")).toBe(true);
    expect(isTerminalTaskStatus("FAILED")).toBe(true);
    expect(isTerminalTaskStatus("CANCELLED")).toBe(true);
    expect(isTerminalTaskStatus("RUNNING")).toBe(false);
    expect(isTerminalTaskStatus("WAITING_FOR_USER")).toBe(false);
  });

  it("rejects unknown statuses", () => {
    expect(TaskStatusSchema.safeParse("pending").success).toBe(false);
  });
});

describe("DeviceStatusSchema", () => {
  it("includes all required statuses", () => {
    expect(DEVICE_STATUSES).toEqual([
      "ONLINE",
      "OFFLINE",
      "LOCKED",
      "PAUSED",
      "ERROR",
    ]);
  });

  it("rejects revoked / unknown", () => {
    expect(DeviceStatusSchema.safeParse("REVOKED").success).toBe(false);
  });
});

describe("DeviceOsSchema", () => {
  it("accepts supported OS values", () => {
    for (const os of ["darwin", "win32", "linux"] as const) {
      expect(DeviceOsSchema.safeParse(os).success).toBe(true);
    }
  });

  it("rejects unsupported OS", () => {
    expect(DeviceOsSchema.safeParse("android").success).toBe(false);
  });
});
