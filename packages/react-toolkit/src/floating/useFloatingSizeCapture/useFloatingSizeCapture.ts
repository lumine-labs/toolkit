import { type AutoUpdateOptions, type UseFloatingReturn, autoUpdate, size, useFloating } from "@floating-ui/react"

export type UseFloatingSizeCaptureOptions = AutoUpdateOptions

// Mirrors the reference element's dimensions onto the floating element as
// `--{prefix}-width` / `--{prefix}-height` CSS variables, kept in sync via a
// ResizeObserver. Ancestor scroll/resize and layout-shift tracking are off by
// default because only the elements' own dimensions matter here.
export const useFloatingSizeCapture = (prefix: string, options?: UseFloatingSizeCaptureOptions): UseFloatingReturn => {
    return useFloating({
        whileElementsMounted: (...args) =>
            autoUpdate(...args, {
                /**
                 * Whether to update the position when an overflow ancestor is scrolled.
                 * @default false
                 */
                ancestorScroll: false,
                /**
                 * Whether to update the position when an overflow ancestor is resized. This
                 * uses the native `resize` event.
                 * @default false
                 */
                ancestorResize: false,
                /**
                 * Whether to update the position when either the reference or floating
                 * elements resized. This uses a `ResizeObserver`.
                 * @default true
                 */
                elementResize: true,
                /**
                 * Whether to update the position when the reference relocated on the screen
                 * due to layout shift.
                 * @default false
                 */
                layoutShift: false,
                /**
                 * Whether to update on every animation frame if necessary. Only use if you
                 * need to update the position in response to an animation using transforms.
                 * @default false
                 */
                animationFrame: false,
                ...options,
            }),
        middleware: [
            size({
                apply: ({ elements, rects }) => {
                    const style = elements.floating.style
                    style.setProperty(`--${prefix}-width`, `${rects.reference.width}px`)
                    style.setProperty(`--${prefix}-height`, `${rects.reference.height}px`)
                },
            }),
        ],
    })
}
