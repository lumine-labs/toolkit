import { observeResize } from "@lumelabs/toolkit"
import { useCallback, useRef, useState } from "react"

// Reports whether an element's text is vertically truncated (scrollHeight
// exceeds clientHeight). Measures on mount and re-measures via the shared
// ResizeObserver whenever the element's size changes. Content changes that
// don't affect the element's size do not retrigger measurement.
export const useIsTruncated = <T extends HTMLElement>() => {
    const [isTruncated, setIsTruncated] = useState(false)
    const unobserveRef = useRef<(() => void) | null>(null)

    const ref = useCallback((element: T | null) => {
        unobserveRef.current?.()
        unobserveRef.current = null

        if (!element) {
            return
        }

        const measure = () => setIsTruncated(element.scrollHeight > element.clientHeight)
        measure()

        unobserveRef.current = observeResize(element, measure)
    }, [])

    return { ref, isTruncated }
}
