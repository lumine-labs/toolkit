import { debounce, type DebouncedFunction } from "es-toolkit"
import { useEffect, useMemo } from "react"
import { useEvent } from "../useEvent/index.js"

// es-toolkit's DebounceOptions minus `signal`: unmount cancellation is the
// hook's job, so a consumer AbortSignal is deliberately not accepted.
export type UseDebounceOptions = {
    edges?: Array<"leading" | "trailing">
}

// Debounced wrapper with a stable identity: the latest callback is always
// invoked (useEvent), and timer state survives re-renders — it resets only
// when wait or the option values actually change. Cancels on unmount.
export const useDebounceCallback = <T extends (...args: any[]) => void>(
    callback: T,
    wait = 500,
    options?: UseDebounceOptions
): DebouncedFunction<T> => {
    const stableCallback = useEvent(callback)
    const edgesKey = options?.edges?.join(",")

    const debounced = useMemo(
        () => debounce(stableCallback, wait, { edges: options?.edges }),
        // memoized on the option values, not the object identity
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [stableCallback, wait, edgesKey]
    )

    useEffect(() => () => debounced.cancel(), [debounced])

    return debounced
}
