import { debounce, type DebouncedFunction } from "es-toolkit"
import { useEffect, useMemo } from "react"
import { useEvent } from "../useEvent/index.js"

export type UseDebounceOptions = {
    edges?: Array<"leading" | "trailing">
}

export const useDebounceCallback = <T extends (...args: any[]) => void>(
    callback: T,
    wait = 500,
    options?: UseDebounceOptions
): DebouncedFunction<T> => {
    const stableCallback = useEvent(callback)
    const edgesKey = options?.edges?.join(",")

    const debounced = useMemo(
        () => debounce(stableCallback, wait, { edges: options?.edges }),
        [stableCallback, wait, edgesKey]
    )

    useEffect(() => () => debounced.cancel(), [debounced])

    return debounced
}
