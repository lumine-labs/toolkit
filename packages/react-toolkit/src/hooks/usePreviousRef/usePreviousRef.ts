import { useEffect, useRef } from "react"

// Ref holding the value from the previous committed render (undefined before
// the first). A ref rather than a value, mirroring useLatestRef — read
// .current in render or callbacks alike.
export const usePreviousRef = <T>(value: T) => {
    const previousRef = useRef<T | undefined>(undefined)

    useEffect(() => {
        previousRef.current = value
    })

    return previousRef
}
