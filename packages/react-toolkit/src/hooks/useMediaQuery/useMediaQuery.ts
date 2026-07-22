import { createKeyedStore } from "@lumelabs/toolkit"
import { useCallback, useSyncExternalStore } from "react"

type UseMediaQueryOptions = {
    defaultValue?: boolean
}

// One MediaQueryList and one "change" listener per distinct query, owned by a
// keyed store: created when a query gains its first subscriber, torn down when
// it loses its last one.
const store = createKeyedStore<boolean>({
    onActive: (query) => {
        const mql = window.matchMedia(query)
        const onChange = () => store.write(query, mql.matches)

        mql.addEventListener("change", onChange)
        store.write(query, mql.matches)

        return () => {
            mql.removeEventListener("change", onChange)
            store.clear(query)
        }
    },
})

// Falls back to a throwaway MediaQueryList for reads that happen before the
// first subscription — never stored, so snapshots stay free of side effects.
const getMatches = (query: string) => store.read(query) ?? window.matchMedia(query).matches

export const useMediaQuery = (query: string, { defaultValue = false }: UseMediaQueryOptions = {}) => {
    const subscribeToQuery = useCallback((callback: () => void) => store.watch(query, callback), [query])

    return useSyncExternalStore(
        subscribeToQuery,
        () => getMatches(query),
        () => defaultValue
    )
}
