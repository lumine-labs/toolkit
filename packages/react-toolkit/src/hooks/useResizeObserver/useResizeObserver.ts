import { observeResize } from "@lumelabs/toolkit"
import { useEffect, type RefObject } from "react"
import { useEvent } from "../useEvent/index.js"

type UseResizeObserverOptions = {
    box?: ResizeObserverBoxOptions
}

// Runs the callback whenever the element resizes (including once on attach,
// per ResizeObserver semantics). Hook instances share one observer per box.
export const useResizeObserver = <T extends Element>(
    ref: RefObject<T | null>,
    callback: (entry: ResizeObserverEntry) => void,
    { box = "content-box" }: UseResizeObserverOptions = {}
) => {
    const stableCallback = useEvent(callback)

    useEffect(() => {
        const element = ref.current
        if (!element) return
        return observeResize(element, stableCallback, box)
    }, [ref, stableCallback, box])
}
