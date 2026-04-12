import { useCallback, useRef } from "react"
import { useIsomorphicLayoutEffect } from "../useIsomorphicLayoutEffect"

export function useEvent<T extends (...args: any[]) => any>(callback: T) {
    const callbackRef = useRef(callback)

    useIsomorphicLayoutEffect(() => {
        callbackRef.current = callback
    }, [callback])

    const event = useCallback((...args: Parameters<T>) => {
        return callbackRef.current.apply(null, args)
    }, [])

    return event
}
