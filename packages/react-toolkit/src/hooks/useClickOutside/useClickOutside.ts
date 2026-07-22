import { type RefObject } from "react"
import { useEvent } from "../useEvent/index.js"
import { useEventListener, type UseEventListenerOptions } from "../useEventListener/index.js"

type UseClickOutsideOptions<K extends keyof DocumentEventMap> = UseEventListenerOptions & {
    event?: K
}

export const useClickOutside = <K extends keyof DocumentEventMap = "pointerdown">(
    refs: RefObject<HTMLElement | null> | RefObject<HTMLElement | null>[],
    handler: (event: DocumentEventMap[K]) => void,
    options?: UseClickOutsideOptions<K>
) => {
    const { event = "pointerdown" as K, ...listenerOptions } = options ?? {}

    const onEvent = useEvent((e: DocumentEventMap[K]) => {
        const targets = Array.isArray(refs) ? refs : [refs]
        const isInside = targets.some((ref) => ref.current?.contains(e.target as Node))
        if (!isInside) handler(e)
    })

    const target = typeof document === "undefined" ? null : document
    useEventListener(event, onEvent as (e: Event) => void, { ...listenerOptions, target })
}
