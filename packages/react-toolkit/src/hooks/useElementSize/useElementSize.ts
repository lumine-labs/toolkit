import { extractEntrySize, observeResize } from "@lumelabs/toolkit"
import { useCallback, useRef, useState } from "react"
import { useLatestRef } from "../useLatestRef/index.js"

type ElementSize = {
    width: number
    height: number
}

type UseElementSizeOptions = {
    box?: ResizeObserverBoxOptions
}

// Tracks an element's size (of the given box, default content box) via the
// shared ResizeObserver. Width and height stay 0 until the callback ref
// attaches; `box` is applied at attach time.
export const useElementSize = <T extends Element>({ box = "content-box" }: UseElementSizeOptions = {}) => {
    const [size, setSize] = useState<ElementSize>({ width: 0, height: 0 })
    const unobserveRef = useRef<(() => void) | null>(null)
    const boxRef = useLatestRef(box)

    const ref = useCallback(
        (element: T | null) => {
            unobserveRef.current?.()
            unobserveRef.current = null

            if (!element) return

            const attachedBox = boxRef.current
            const onResize = (entry: ResizeObserverEntry) => {
                const next = extractEntrySize(entry, attachedBox)
                setSize((current) => {
                    if (current.width === next.width && current.height === next.height) return current
                    return next
                })
            }
            unobserveRef.current = observeResize(element, onResize, attachedBox)
        },
        [boxRef]
    )

    return { ref, width: size.width, height: size.height }
}
