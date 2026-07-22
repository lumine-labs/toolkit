import { useRef, type MutableRefObject } from "react"

export function useLazyRef<T>(fn: () => T) {
    const ref = useRef<T>(undefined)

    if (ref.current === undefined) {
        ref.current = fn()
    }

    return ref as MutableRefObject<T>
}
