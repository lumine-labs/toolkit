import { useEffect, type RefObject } from "react"
import { useEvent } from "../useEvent/index.js"

type UseIntersectionObserverOptions = {
    root?: RefObject<Element | null>
    rootMargin?: string
    threshold?: number | number[]
}

// Runs the callback when the element's intersection with the root changes.
export const useIntersectionObserver = <T extends Element>(
    ref: RefObject<T | null>,
    callback: (entry: IntersectionObserverEntry) => void,
    { root, rootMargin, threshold }: UseIntersectionObserverOptions = {}
) => {
    const stableCallback = useEvent(callback)
    const thresholdKey = Array.isArray(threshold) ? threshold.join(",") : threshold

    useEffect(() => {
        const element = ref.current
        if (!element || typeof IntersectionObserver === "undefined") return

        const observer = new IntersectionObserver((entries) => entries.forEach((entry) => stableCallback(entry)), {
            root: root?.current ?? null,
            rootMargin,
            threshold,
        })
        observer.observe(element)
        return () => observer.disconnect()
        // threshold participates via thresholdKey so an inline array doesn't
        // re-create the observer every render
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ref, stableCallback, root, rootMargin, thresholdKey])
}
