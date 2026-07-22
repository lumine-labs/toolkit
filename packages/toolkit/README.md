# @lumelabs/toolkit

> ⚠️ **Experimental / Internal Use**
>
> Primarily intended for personal and internal use. It may change, break, or be
> restructured at any time. Don't rely on it for public projects unless you're
> prepared to maintain your own fork. Issues/feature requests may be closed without response.

Small, framework-free TypeScript primitives. ESM-only. Ships types.

## Install

```bash
npm install @lumelabs/toolkit
```

Peer-free; pulls in [`es-toolkit`](https://github.com/toss/es-toolkit) as its only runtime dependency (tree-shakeable).

## What's inside

Everything is re-exported from the package root. Source is organised by domain under `src/`:

- **`async/`** — `LinkedAbortController` (chains an `AbortController` to parent signals).
- **`dom/`** — `createFileList` (the `DataTransfer` trick for populating a file input), `getTextWidth`, `isIFrame`, `observeResize` + `extractEntrySize` (one shared `ResizeObserver` per box type, refcounted).
- **`errors/`** — `tc` (error-first `[error, value]` result tuples over `es-toolkit`'s `attempt`, plus `syncSafe`/`asyncSafe` with an `onError` callback), `assertNever`.
- **`pubsub/`** — `EventBus` (typed event map), `createKeyedStore` (refcounted per-key subscription store with an `onActive` resource lifecycle).
- **`string/`** — `maskString`, `sortStrings`.
- **`types/`** — `Enum` (const-object enum helper + `Enum<T>` type), `DeepPartial`.

```ts
import { EventBus, tc, Enum } from "@lumelabs/toolkit"
```

For anything not covered here, reach for `es-toolkit` directly — this package deliberately doesn't re-wrap what it already does well.

## License

MIT © Lumelabs
