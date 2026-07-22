# @lumelabs/react-toolkit

> ⚠️ **Experimental / Internal Use**
>
> Primarily intended for personal and internal use. It may change, break, or be
> restructured at any time. Don't rely on it for public projects unless you're
> prepared to maintain your own fork. Issues/feature requests may be closed without response.

React-level primitives — hooks, small utilities, and factories. ESM-only. Ships types.

## Install

```bash
npm install @lumelabs/react-toolkit
```

- **Peer:** `react` `^18 || ^19`.
- **Optional peer:** `@floating-ui/react` (`>=0.26.0`) — only needed if you import the `./floating` entry.
- Depends on [`@lumelabs/toolkit`](https://www.npmjs.com/package/@lumelabs/toolkit) and `es-toolkit`.

## Entry points

| Import | Holds |
| --- | --- |
| `@lumelabs/react-toolkit` | everything below re-exported |
| `@lumelabs/react-toolkit/hooks` | the hooks |
| `@lumelabs/react-toolkit/utils` | non-hook helpers (`mergeRefs`, `extractProps`, `castNodeToBoolean`, `castDataPropToBoolean`) |
| `@lumelabs/react-toolkit/factories` | `createSlots`, `createStorageHook`, `createBreakpointHook` |
| `@lumelabs/react-toolkit/floating` | `useFloatingSizeCapture` (requires the optional `@floating-ui/react` peer) |

The `floating` entry is isolated on its own subpath so the core import graph never pulls in `@floating-ui`.

## Hooks (overview)

State & refs (`useControllableState`, `useLatestRef`, `usePreviousRef`, `useLazyRef`, `useForceRerender`), events (`useEventListener`, `useClickOutside`, `useEvent`), layout & size (`useElementSize`, `useResizeObserver`, `useSizeCapture`, `useIsTruncated`, `useIntersectionObserver`, `useIsomorphicLayoutEffect`, `useScheduleLayoutEffect`), media (`useMediaQuery`), storage (`useLocalStorage`, `useSessionStorage`), debounce (`useDebounceCallback`, `useDebounceValue`), ids (`useId`, `createUseId`), and dev guards (`useControlledSwitchWarning`).

```ts
import { useEventListener, useControllableState } from "@lumelabs/react-toolkit"
```

The set changes often — check the source or your editor's autocomplete for the current list.

## License

MIT © Lumelabs
