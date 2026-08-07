import { z } from "zod";

/** Mouse button for click / double-click actions. */
export const MouseButtonSchema = z.enum(["LEFT", "RIGHT", "MIDDLE"]);
export type MouseButton = z.infer<typeof MouseButtonSchema>;

export const ClickParamsSchema = z.object({
  x: z.number().finite(),
  y: z.number().finite(),
  button: MouseButtonSchema.default("LEFT"),
});
export type ClickParams = z.infer<typeof ClickParamsSchema>;

export const DoubleClickParamsSchema = z.object({
  x: z.number().finite(),
  y: z.number().finite(),
  button: MouseButtonSchema.default("LEFT"),
});
export type DoubleClickParams = z.infer<typeof DoubleClickParamsSchema>;

export const MoveMouseParamsSchema = z.object({
  x: z.number().finite(),
  y: z.number().finite(),
});
export type MoveMouseParams = z.infer<typeof MoveMouseParamsSchema>;

export const TypeTextParamsSchema = z.object({
  text: z.string().min(1).max(10_000),
});
export type TypeTextParams = z.infer<typeof TypeTextParamsSchema>;

export const KeyPressParamsSchema = z.object({
  key: z.string().min(1).max(64),
});
export type KeyPressParams = z.infer<typeof KeyPressParamsSchema>;

export const HotkeyParamsSchema = z.object({
  keys: z.array(z.string().min(1).max(64)).min(1).max(6),
});
export type HotkeyParams = z.infer<typeof HotkeyParamsSchema>;

export const OpenAppParamsSchema = z.object({
  app: z.string().min(1).max(256),
});
export type OpenAppParams = z.infer<typeof OpenAppParamsSchema>;

export const WaitParamsSchema = z.object({
  ms: z.number().int().min(0).max(60_000),
});
export type WaitParams = z.infer<typeof WaitParamsSchema>;

export const ScreenshotParamsSchema = z.object({
  reason: z.string().max(500).optional(),
});
export type ScreenshotParams = z.infer<typeof ScreenshotParamsSchema>;

export const DoneParamsSchema = z.object({
  summary: z.string().max(2000).optional(),
});
export type DoneParams = z.infer<typeof DoneParamsSchema>;

export const AskUserParamsSchema = z.object({
  question: z.string().min(1).max(2000),
  reason: z.string().max(1000).optional(),
});
export type AskUserParams = z.infer<typeof AskUserParamsSchema>;
