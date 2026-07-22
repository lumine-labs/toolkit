import { useRef } from "react"
import { useIsomorphicLayoutEffect } from "../useIsomorphicLayoutEffect/index.js"

export function useLatestRef<T>(value: T) {
    const latestRef = useRef<T>(value)

    useIsomorphicLayoutEffect(() => {
        latestRef.current = value
    })

    return latestRef
}
