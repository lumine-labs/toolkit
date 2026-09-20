import { extractEntrySize } from "@luminelabs/toolkit"
import { useRef } from "react"
import { useIsomorphicLayoutEffect } from "../useIsomorphicLayoutEffect/index.js"
import { useResizeObserver } from "../useResizeObserver/index.js"

type ElementSize = {
    width: number
    height: number
}

type UseSizeCaptureOptions = {
    source: Element | null
    target: HTMLElement | null
    prefix: string
    box?: ResizeObserverBoxOptions
}

// Mirrors the source element's dimensions onto the target element as
// `--{prefix}-width` / `--{prefix}-height` CSS variables via the shared
// ResizeObserver.
export const useSizeCapture = ({ source, target, prefix, box = "border-box" }: UseSizeCaptureOptions): void => {
    const sizeRef = useRef<ElementSize | null>(null)

    useResizeObserver(
        source,
        (entry) => {
            const size = extractEntrySize(entry, box)
            sizeRef.current = size
            if (!target) return

            applySize(target, prefix, size)
        },
        { box }
    )

    useIsomorphicLayoutEffect(() => {
        const size = sizeRef.current
        if (!target || !size) return

        applySize(target, prefix, size)
    }, [target, prefix])
}

// Helpers
// ========================================

function applySize(target: HTMLElement, prefix: string, size: ElementSize): void {
    target.style.setProperty(`--${prefix}-width`, `${size.width}px`)
    target.style.setProperty(`--${prefix}-height`, `${size.height}px`)
}
