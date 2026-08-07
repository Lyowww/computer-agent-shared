# @petai/computer-agent-shared

Shared TypeScript contracts for the **Computer Agent** ecosystem.

This package contains **no application logic**. It only defines:

- TypeScript types
- Zod schemas
- WebSocket event definitions
- Action definitions
- API DTOs
- Task / device status definitions

Consumers should install this package and import from it instead of duplicating protocol definitions.

## Consumers

| Project | Role |
|---------|------|
| `computer-agent-web` | Web client |
| `computer-agent-backend` | Backend / gateway |
| `computer-desktop-agent` | Desktop executor |
| `ai-computer-agent` | AI planner |

## Install

### From npm (private registry)

```bash
npm install @petai/computer-agent-shared
```

### From a private Git repository

```bash
npm install git+ssh://git@github.com:petai/computer-agent-shared.git#v1.0.0
# or
npm install github:petai/computer-agent-shared#v1.0.0
```

### Local monorepo / sibling checkout

```bash
npm install ../computer-agent-shared
# or with file protocol
npm install file:../computer-agent-shared
```

Peer dependency: **Zod** `^3.23.0` (also bundled as a dependency for convenience).

## Quick start

```ts
import {
  ExecuteActionSchema,
  ActionTypeSchema,
  TaskStatusSchema,
  DeviceStatusSchema,
  WsMessageSchema,
  type ComputerAction,
  type WsEvent,
} from "@petai/computer-agent-shared";

const message = ExecuteActionSchema.parse({
  event: "EXECUTE_ACTION",
  payload: {
    actionId: "act-1",
    type: "CLICK",
    params: { x: 120, y: 340 },
  },
});
```

## WebSocket events

| Event | Direction (typical) |
|-------|---------------------|
| `REGISTER_DEVICE` | Desktop → Backend |
| `DEVICE_REGISTERED` | Backend → Desktop |
| `DEVICE_STATUS` | Backend → Web |
| `CAPTURE_SCREEN` | Backend → Desktop |
| `SCREEN_RESULT` | Desktop → Backend → Web |
| `EXECUTE_ACTION` | Backend → Desktop |
| `ACTION_RESULT` | Desktop → Backend → Web |
| `USER_MESSAGE` | Web → Backend |
| `AI_RESPONSE` | Backend → Web |
| `TASK_START` | Backend → Web |
| `TASK_UPDATE` | Backend → Web |
| `TASK_COMPLETED` | Backend → Web |
| `TASK_FAILED` | Backend → Web |
| `ASK_USER` | Backend → Web |
| `PING` / `PONG` | Bidirectional |
| `ERROR` | Backend → * |

All messages are available as:

- Payload schemas (`ExecuteActionPayloadSchema`, …)
- Full event schemas (`ExecuteActionSchema`, …)
- Discriminated union: `WsMessageSchema`

Envelope helper for a shared `message` channel:

```ts
import { createEnvelope, WsEnvelopeSchema } from "@petai/computer-agent-shared";

const envelope = createEnvelope("PING", { nonce: "abcdefgh" });
```

## Action types

`CLICK` · `DOUBLE_CLICK` · `MOVE_MOUSE` · `TYPE_TEXT` · `KEY_PRESS` · `HOTKEY` · `OPEN_APP` · `WAIT` · `SCREENSHOT` · `DONE` · `ASK_USER`

- `ActionTypeSchema` — enum of action names
- `ComputerActionSchema` — discriminated union with typed params
- `LooseActionSchema` — wire-friendly `{ type, params, reason? }` (rejects shell/exec keys)

## Task statuses

`CREATED` · `RUNNING` · `WAITING_FOR_SCREEN` · `WAITING_FOR_ACTION` · `WAITING_FOR_USER` · `COMPLETED` · `FAILED` · `CANCELLED`

## Device statuses

`ONLINE` · `OFFLINE` · `LOCKED` · `PAUSED` · `ERROR`

## API DTOs

Auth, device, and task REST DTOs plus AI plan HTTP contracts:

- `LoginRequestSchema` / `RegisterRequestSchema`
- `CreateDeviceRequestSchema` / `DeviceDtoSchema`
- `CreateTaskRequestSchema` / `TaskDtoSchema`
- `PlanRequestSchema` / `PlanResponseSchema`
- `AiPlanResponseSchema`
- `agentStatusToWire` / `wireStatusToAgent` — map `ACTION_REQUIRED` ↔ `continue`, etc.

## Package layout

```
src/
  actions/     Action types + param schemas
  events/      WebSocket events, payloads, envelope
  statuses/    Task + device status enums
  dto/         REST + AI plan DTOs
  index.ts     Public exports
```

## Development

```bash
npm install
npm test
npm run typecheck
npm run build
```

Build output (ESM + CJS + types):

- `dist/index.js` — ESM
- `dist/index.cjs` — CommonJS
- `dist/index.d.ts` — TypeScript declarations

## Versioning

Treat this package as a **protocol contract**. Breaking changes to event names, required payload fields, or status enums should bump the **major** version. Additive fields and new optional events may bump **minor**.

## License

MIT
