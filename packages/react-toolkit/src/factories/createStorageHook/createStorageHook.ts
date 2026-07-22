import { createKeyedStore, tc } from "@lumelabs/toolkit"
import { useCallback, useMemo, useSyncExternalStore } from "react"
import { useLatestRef } from "../../hooks/useLatestRef/index.js"

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">

type SetStorageValue<T> = (next: T | ((previous: T) => T)) => void

// Creates a reactive storage hook bound to a Storage implementation. Values
// are JSON-encoded. Every hook instance with the same key stays in sync
// within the tab (shared keyed store) and across tabs (the "storage" event).
export const createStorageHook = (getStorage: () => StorageLike) => {
    const storage = () => tc.syncSafe(getStorage) ?? null

    const store = createKeyedStore<string | null>({
        onActive: (key) => {
            const initialValue = storage()?.getItem(key) ?? null
            store.write(key, initialValue)

            const onStorageEvent = (event: StorageEvent) => {
                if (event.key === key) store.write(key, event.newValue)
            }

            window.addEventListener("storage", onStorageEvent)
            return () => {
                window.removeEventListener("storage", onStorageEvent)
                store.clear(key)
            }
        },
    })

    const readRaw = (key: string) => {
        const stored = store.read(key)
        if (stored !== undefined) return stored
        return storage()?.getItem(key) ?? null
    }

    const useStorageValue = <T>(key: string, initialValue: T) => {
        const initialValueRef = useLatestRef(initialValue)

        const subscribe = useCallback((callback: () => void) => store.watch(key, callback), [key])

        const raw = useSyncExternalStore(
            subscribe,
            () => readRaw(key),
            () => null
        )

        const value = useMemo(() => {
            if (raw === null) return initialValueRef.current
            const [error, parsed] = tc.sync(() => JSON.parse(raw) as T)
            return error !== null ? initialValueRef.current : (parsed as T)
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [raw])

        const setValue = useCallback<SetStorageValue<T>>(
            (next) => {
                let previous = initialValueRef.current
                const previousRaw = readRaw(key)
                if (previousRaw !== null) {
                    const [error, parsed] = tc.sync(() => JSON.parse(previousRaw) as T)
                    if (error === null) previous = parsed as T
                }

                const resolved = typeof next === "function" ? (next as (p: T) => T)(previous) : next
                const encoded = JSON.stringify(resolved)
                tc.syncSafe(() => storage()?.setItem(key, encoded))
                store.write(key, encoded)
            },
            [key, initialValueRef]
        )

        const remove = useCallback(() => {
            tc.syncSafe(() => storage()?.removeItem(key))
            store.write(key, null)
        }, [key])

        return [value, setValue, remove] as const
    }

    return useStorageValue
}
