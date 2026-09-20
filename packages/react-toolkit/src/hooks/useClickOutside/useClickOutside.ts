import { useEvent } from "../useEvent/index.js"
import { useEventListener, type UseEventListenerOptions } from "../useEventListener/index.js"

type UseClickOutsideOptions<K extends keyof DocumentEventMap> = UseEventListenerOptions & {
    event?: K
}

export const useClickOutside = <K extends keyof DocumentEventMap = "pointerdown">(
    elements: HTMLElement | null | (HTMLElement | null)[],
    handler: (event: DocumentEventMap[K]) => void,
    options?: UseClickOutsideOptions<K>
): void => {
    const { event = "pointerdown" as K, ...listenerOptions } = options ?? {}

    const onEvent = useEvent((e: DocumentEventMap[K]) => {
        const targets = Array.isArray(elements) ? elements : [elements]
        const isInside = targets.some((element) => element?.contains(e.target as Node))
        if (!isInside) handler(e)
    })

    const target = typeof document === "undefined" ? null : document
    useEventListener(event, onEvent as (e: Event) => void, { ...listenerOptions, target })
}
