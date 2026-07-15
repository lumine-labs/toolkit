import { useRef } from "react"
import { useIsomorphicLayoutEffect } from "../useIsomorphicLayoutEffect/index.js"

export function useAsRef<T>(data: T) {
    const ref = useRef<T>(data)

    useIsomorphicLayoutEffect(() => {
        ref.current = data
    })

    return ref
}
