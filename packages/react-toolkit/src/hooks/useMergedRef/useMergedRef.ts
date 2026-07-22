import { useCallback } from "react"
import { mergeRefs, type PossibleRef } from "../../utils/mergeRefs/index.js"

export const useMergedRef = <T>(...refs: PossibleRef<T>[]) => {
    // Memoized on the refs themselves: a new merged callback each render would
    // make React detach and reattach every ref on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return useCallback(mergeRefs(...refs), refs)
}
