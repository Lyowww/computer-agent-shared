import { z } from "zod";
import { WsEventSchema } from "./types.js";

/**
 * Generic transport envelope wrapping an event payload.
 * Used when messages are sent on a shared `message` channel.
 */
export const WsEnvelopeSchema = z.object({
  event: WsEventSchema,
  payload: z.unknown(),
  requestId: z.string().min(1).max(128).optional(),
  timestamp: z.number().int().nonnegative().optional(),
});

export type WsEnvelope<T = unknown> = {
  event: z.infer<typeof WsEventSchema>;
  payload: T;
  requestId?: string;
  timestamp?: number;
};

export function createEnvelope<T>(
  event: z.infer<typeof WsEventSchema>,
  payload: T,
  options?: { requestId?: string; timestamp?: number },
): WsEnvelope<T> {
  return {
    event,
    payload,
    requestId: options?.requestId,
    timestamp: options?.timestamp ?? Date.now(),
  };
}
