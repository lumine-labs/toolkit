import { extractEntrySize, observeResize } from "@lumelabs/toolkit"
import { useCallback, useRef } from "react"
import { useLatestRef } from "../useLatestRef/index.js"

type UseSizeCaptureOptions = {
    box?: ResizeObserverBoxOptions
}

// Mirrors the source element's dimensions onto the target element as
// `--{prefix}-width` / `--{prefix}-height` CSS variables via the shared
// ResizeObserver. Sizes come from the observed box (default border-box), not
// getBoundingClientRect, so CSS transforms are not reflected. Style writes
// are imperative — no re-renders.
export const useSizeCapture = (prefix: string, { box = "border-box" }: UseSizeCaptureOptions = {}) => {
    const prefixRef = useLatestRef(prefix)
    const boxRef = useLatestRef(box)

    const sizeRef = useRef<{ width: number; height: number } | null>(null)
    const targetRef = useRef<HTMLElement | null>(null)
    const unobserveRef = useRef<(() => void) | null>(null)

    const apply = useCallback(() => {
        const target = targetRef.current
        const size = sizeRef.current
        if (!target || !size) return

        target.style.setProperty(`--${prefixRef.current}-width`, `${size.width}px`)
        target.style.setProperty(`--${prefixRef.current}-height`, `${size.height}px`)
    }, [prefixRef])

    const setSource = useCallback(
        (element: Element | null) => {
            unobserveRef.current?.()
            unobserveRef.current = null

            if (!element) return

            const attachedBox = boxRef.current
            const onResize = (entry: ResizeObserverEntry) => {
                sizeRef.current = extractEntrySize(entry, attachedBox)
                apply()
            }
            unobserveRef.current = observeResize(element, onResize, attachedBox)
        },
        [apply, boxRef]
    )

    const setTarget = useCallback(
        (element: HTMLElement | null) => {
            targetRef.current = element
            apply()
        },
        [apply]
    )

    return { setSource, setTarget }
}
