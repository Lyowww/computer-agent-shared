import { z } from "zod";

/**
 * Runtime status of a registered desktop device.
 */
export const DeviceStatusSchema = z.enum([
  "ONLINE",
  "OFFLINE",
  "LOCKED",
  "PAUSED",
  "ERROR",
]);

export type DeviceStatus = z.infer<typeof DeviceStatusSchema>;

export const DEVICE_STATUSES = DeviceStatusSchema.options;

/**
 * Supported desktop operating systems.
 */
export const DeviceOsSchema = z.enum(["darwin", "win32", "linux"]);
export type DeviceOs = z.infer<typeof DeviceOsSchema>;

export const DEVICE_OS = DeviceOsSchema.options;
