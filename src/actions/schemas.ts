import { z } from "zod";
import {
  AskUserParamsSchema,
  ClickParamsSchema,
  DoneParamsSchema,
  DoubleClickParamsSchema,
  HotkeyParamsSchema,
  KeyPressParamsSchema,
  MoveMouseParamsSchema,
  OpenAppParamsSchema,
  ScreenshotParamsSchema,
  TypeTextParamsSchema,
  WaitParamsSchema,
} from "./params.js";

/**
 * Computer-control action types shared across AI, backend, desktop agent, and web.
 */
export const ActionTypeSchema = z.enum([
  "CLICK",
  "DOUBLE_CLICK",
  "MOVE_MOUSE",
  "TYPE_TEXT",
  "KEY_PRESS",
  "HOTKEY",
  "OPEN_APP",
  "WAIT",
  "SCREENSHOT",
  "DONE",
  "ASK_USER",
]);

export type ActionType = z.infer<typeof ActionTypeSchema>;

export const ACTION_TYPES = ActionTypeSchema.options;

/**
 * Strongly typed computer action (discriminated on `type`).
 * Prefer this when validating planned or executed actions.
 */
export const ComputerActionSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("CLICK"), params: ClickParamsSchema }),
  z.object({ type: z.literal("DOUBLE_CLICK"), params: DoubleClickParamsSchema }),
  z.object({ type: z.literal("MOVE_MOUSE"), params: MoveMouseParamsSchema }),
  z.object({ type: z.literal("TYPE_TEXT"), params: TypeTextParamsSchema }),
  z.object({ type: z.literal("KEY_PRESS"), params: KeyPressParamsSchema }),
  z.object({ type: z.literal("HOTKEY"), params: HotkeyParamsSchema }),
  z.object({ type: z.literal("OPEN_APP"), params: OpenAppParamsSchema }),
  z.object({ type: z.literal("WAIT"), params: WaitParamsSchema }),
  z.object({ type: z.literal("SCREENSHOT"), params: ScreenshotParamsSchema }),
  z.object({ type: z.literal("DONE"), params: DoneParamsSchema }),
  z.object({ type: z.literal("ASK_USER"), params: AskUserParamsSchema }),
]);

export type ComputerAction = z.infer<typeof ComputerActionSchema>;

/**
 * Loose action shape used on the wire when params are not yet narrowed.
 * Forbidden shell/exec keys are rejected.
 */
const FORBIDDEN_ACTION_KEYS = [
  "command",
  "shell",
  "exec",
  "script",
  "powershell",
  "bash",
  "cmd",
] as const;

export const ActionParamsRecordSchema = z
  .record(z.unknown())
  .superRefine((params, ctx) => {
    for (const key of Object.keys(params)) {
      if (
        (FORBIDDEN_ACTION_KEYS as readonly string[]).includes(key.toLowerCase())
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Forbidden action parameter: ${key}`,
        });
      }
    }
  });

export const LooseActionSchema = z.object({
  type: ActionTypeSchema,
  params: ActionParamsRecordSchema.default({}),
  reason: z.string().max(1000).optional(),
});

export type LooseAction = z.infer<typeof LooseActionSchema>;
