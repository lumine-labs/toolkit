import { observeResize } from "@luminelabs/toolkit"
import { useEvent } from "../useEvent/index.js"
import { useIsomorphicLayoutEffect } from "../useIsomorphicLayoutEffect/index.js"

type UseResizeObserverOptions = {
    box?: ResizeObserverBoxOptions
}

export const useResizeObserver = <T extends Element>(
    element: T | null,
    callback: (entry: ResizeObserverEntry) => void,
    { box = "content-box" }: UseResizeObserverOptions = {}
): void => {
    const stableCallback = useEvent(callback)

    useIsomorphicLayoutEffect(() => {
        if (!element) return
        return observeResize(element, stableCallback, box)
    }, [element, stableCallback, box])
}
