import { useEffect } from "react"
import { useEvent } from "../useEvent/index.js"

type TargetLike = EventTarget | null | undefined

export type UseEventListenerOptions = AddEventListenerOptions & {
    enabled?: boolean
    target?: TargetLike
}

// no target option → window (resolved lazily, SSR-safe); explicit null → detached
const resolveTarget = (target: TargetLike): EventTarget | null => {
    if (target === undefined) return typeof window === "undefined" ? null : window
    return target
}

export function useEventListener<K extends keyof WindowEventMap>(
    event: K,
    listener: (event: WindowEventMap[K]) => void,
    options?: AddEventListenerOptions & { enabled?: boolean; target?: Window | null }
): void
export function useEventListener<K extends keyof HTMLElementEventMap>(
    event: K,
    listener: (event: HTMLElementEventMap[K]) => void,
    options: AddEventListenerOptions & { enabled?: boolean; target: HTMLElement | null }
): void
export function useEventListener<K extends keyof DocumentEventMap>(
    event: K,
    listener: (event: DocumentEventMap[K]) => void,
    options: AddEventListenerOptions & { enabled?: boolean; target: Document | null }
): void
export function useEventListener(
    event: string,
    listener: (event: Event) => void,
    options?: UseEventListenerOptions
): void
export function useEventListener(event: string, listener: (event: Event) => void, options?: UseEventListenerOptions) {
    const stableListener = useEvent(listener)
    const enabled = options?.enabled ?? true

    useEffect(() => {
        const resolved = resolveTarget(options?.target)
        if (!resolved || !enabled) return

        resolved.addEventListener(event, stableListener, options)
        return () => {
            resolved.removeEventListener(event, stableListener, options)
        }
    }, [options?.target, event, stableListener, enabled, options?.capture, options?.passive, options?.once])
}
