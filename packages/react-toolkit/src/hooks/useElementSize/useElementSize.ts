import { extractEntrySize } from "@luminelabs/toolkit"
import { useState } from "react"
import { useIsomorphicLayoutEffect } from "../useIsomorphicLayoutEffect/index.js"
import { useResizeObserver } from "../useResizeObserver/index.js"

type ElementSize = {
    width: number
    height: number
}

type UseElementSizeOptions = {
    box?: ResizeObserverBoxOptions
}

// Tracks the element's size (of the given box, default content box) via the
// shared ResizeObserver. Undefined until the element has been measured, and
// undefined again once it detaches.
export const useElementSize = <T extends Element>(
    element: T | null,
    { box = "content-box" }: UseElementSizeOptions = {}
): ElementSize | undefined => {
    const [size, setSize] = useState<ElementSize | undefined>(undefined)

    useResizeObserver(
        element,
        (entry) => {
            const next = extractEntrySize(entry, box)
            setSize((current) => {
                if (current && current.width === next.width && current.height === next.height) return current
                return next
            })
        },
        { box }
    )

    useIsomorphicLayoutEffect(() => {
        if (element) return
        setSize(undefined)
    }, [element])

    return size
}
