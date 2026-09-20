import { useState } from "react"
import { useIsomorphicLayoutEffect } from "../useIsomorphicLayoutEffect/index.js"
import { useResizeObserver } from "../useResizeObserver/index.js"

// Reports whether the element's text is vertically truncated (scrollHeight exceeds clientHeight).
export const useIsTruncated = <T extends HTMLElement>(element: T | null): boolean => {
    const [isTruncated, setIsTruncated] = useState(false)

    useIsomorphicLayoutEffect(() => {
        if (!element) return
        setIsTruncated(isVerticallyTruncated(element))
    }, [element])

    useResizeObserver(element, (entry) => setIsTruncated(isVerticallyTruncated(entry.target)))

    return isTruncated
}

// Helpers
// ========================================

function isVerticallyTruncated(element: Element): boolean {
    return element.scrollHeight > element.clientHeight
}
