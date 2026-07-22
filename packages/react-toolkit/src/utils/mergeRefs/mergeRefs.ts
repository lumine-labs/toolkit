import type { Ref, RefCallback } from "react"

export type PossibleRef<T> = Ref<T> | undefined

// Sets a ref to a value, handling both callback refs and ref objects.
// Returns the cleanup function when a callback ref provides one (React 19).
const setRef = <T>(ref: PossibleRef<T>, value: T | null) => {
    if (typeof ref === "function") {
        return ref(value)
    }

    if (ref !== null && ref !== undefined) {
        ref.current = value
    }
}

export const mergeRefs = <T>(...refs: PossibleRef<T>[]): RefCallback<T> => {
    return (node) => {
        let hasCleanup = false

        const cleanups = refs.map((ref) => {
            const cleanup = setRef(ref, node)
            hasCleanup ||= typeof cleanup === "function"
            return cleanup
        })

        // React 19 callback refs may return a cleanup. When any child ref does,
        // the merged ref must return one too — otherwise React would never call
        // the merged ref with null and the child cleanups would never run.
        if (hasCleanup) {
            return () => {
                refs.forEach((ref, index) => {
                    const cleanup = cleanups[index]
                    if (typeof cleanup === "function") {
                        cleanup()
                    } else {
                        setRef(ref, null)
                    }
                })
            }
        }
    }
}
