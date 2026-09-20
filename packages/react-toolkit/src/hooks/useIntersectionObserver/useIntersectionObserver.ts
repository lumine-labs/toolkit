import { useEffect } from "react"
import { useEvent } from "../useEvent/index.js"

type UseIntersectionObserverOptions = {
    root?: Element | null
    rootMargin?: string
    threshold?: number | number[]
}

export const useIntersectionObserver = <T extends Element>(
    element: T | null,
    callback: (entry: IntersectionObserverEntry) => void,
    { root, rootMargin, threshold }: UseIntersectionObserverOptions = {}
): void => {
    const stableCallback = useEvent(callback)
    const thresholdKey = Array.isArray(threshold) ? threshold.join(",") : threshold

    useEffect(() => {
        if (!element || typeof IntersectionObserver === "undefined") return

        const observer = new IntersectionObserver((entries) => entries.forEach((entry) => stableCallback(entry)), {
            root: root ?? null,
            rootMargin,
            threshold,
        })
        observer.observe(element)
        return () => observer.disconnect()
    }, [element, stableCallback, root, rootMargin, thresholdKey])
}
