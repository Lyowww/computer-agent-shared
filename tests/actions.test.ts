import { describe, expect, it } from "vitest";
import {
  ActionTypeSchema,
  ACTION_TYPES,
  ComputerActionSchema,
  LooseActionSchema,
  ActionParamsRecordSchema,
  ClickParamsSchema,
} from "../src/index.js";

describe("ActionTypeSchema", () => {
  it("includes all required action types", () => {
    expect(ACTION_TYPES).toEqual([
      "CLICK",
      "DOUBLE_CLICK",
      "MOVE_MOUSE",
      "TYPE_TEXT",
      "KEY_PRESS",
      "HOTKEY",
      "SCROLL",
      "OPEN_APP",
      "WAIT",
      "SCREENSHOT",
      "DONE",
      "ASK_USER",
    ]);
  });

  it("rejects unknown action types", () => {
    expect(ActionTypeSchema.safeParse("DRAG").success).toBe(false);
    expect(ActionTypeSchema.safeParse("TYPE").success).toBe(false);
  });
});

describe("ComputerActionSchema", () => {
  it("parses CLICK with default button", () => {
    const result = ComputerActionSchema.parse({
      type: "CLICK",
      params: { x: 10, y: 20 },
    });
    expect(result).toEqual({
      type: "CLICK",
      params: { x: 10, y: 20, button: "LEFT" },
    });
  });

  it("parses SCROLL", () => {
    const result = ComputerActionSchema.parse({
      type: "SCROLL",
      params: { direction: "down", amount: 10 },
    });
    expect(result).toEqual({
      type: "SCROLL",
      params: { direction: "down", amount: 10 },
    });
  });

  it("parses each action variant", () => {
    const samples = [
      { type: "DOUBLE_CLICK", params: { x: 1, y: 2, button: "RIGHT" } },
      { type: "MOVE_MOUSE", params: { x: 5, y: 6 } },
      { type: "TYPE_TEXT", params: { text: "hello" } },
      { type: "KEY_PRESS", params: { key: "Enter" } },
      { type: "HOTKEY", params: { keys: ["Meta", "c"] } },
      { type: "SCROLL", params: { direction: "up", amount: 3 } },
      { type: "OPEN_APP", params: { app: "Safari" } },
      { type: "WAIT", params: { ms: 500 } },
      { type: "SCREENSHOT", params: { reason: "check UI" } },
      { type: "DONE", params: { summary: "finished" } },
      { type: "ASK_USER", params: { question: "Continue?" } },
    ] as const;

    for (const sample of samples) {
      expect(ComputerActionSchema.safeParse(sample).success).toBe(true);
    }
  });

  it("rejects mismatched params", () => {
    expect(
      ComputerActionSchema.safeParse({
        type: "WAIT",
        params: { text: "nope" },
      }).success,
    ).toBe(false);
  });
});

describe("ClickParamsSchema", () => {
  it("rejects non-finite coordinates", () => {
    expect(ClickParamsSchema.safeParse({ x: NaN, y: 0 }).success).toBe(false);
    expect(ClickParamsSchema.safeParse({ x: 0, y: Infinity }).success).toBe(
      false,
    );
  });
});

describe("ActionParamsRecordSchema / LooseActionSchema", () => {
  it("rejects forbidden shell/exec keys", () => {
    expect(
      ActionParamsRecordSchema.safeParse({ command: "rm -rf /" }).success,
    ).toBe(false);
    expect(ActionParamsRecordSchema.safeParse({ Shell: "bash" }).success).toBe(
      false,
    );
  });

  it("accepts safe params", () => {
    expect(
      LooseActionSchema.safeParse({
        type: "CLICK",
        params: { x: 1, y: 2 },
        reason: "click button",
      }).success,
    ).toBe(true);
  });

  it("defaults params to empty object", () => {
    const parsed = LooseActionSchema.parse({ type: "SCREENSHOT" });
    expect(parsed.params).toEqual({});
  });
});
