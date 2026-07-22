export type KeyedStore<V> = {
    read: (key: string) => V | undefined
    watch: (key: string, listener: () => void) => () => void
    write: (key: string, value: V) => void
    clear: (key: string) => void
}

export type CreateKeyedStoreOptions = {
    // Runs when a key gains its first watcher; the returned cleanup runs when
    // the key loses its last one. Lets the store own an external resource
    // (event listener, observer, ...) per key.
    onActive?: (key: string) => (() => void) | void
}

export const createKeyedStore = <V>(options: CreateKeyedStoreOptions = {}): KeyedStore<V> => {
    const contents = new Map<string, V>()
    const listeners = new Map<string, Set<() => void>>()
    const cleanups = new Map<string, (() => void) | void>()

    const notify = (key: string) => listeners.get(key)?.forEach((listener) => listener())

    return {
        read: (key) => contents.get(key),
        watch: (key, listener) => {
            let set = listeners.get(key)
            if (!set) {
                set = new Set()
                listeners.set(key, set)
            }

            set.add(listener)
            if (set.size === 1) {
                cleanups.set(key, options.onActive?.(key))
            }

            return () => {
                if (set.delete(listener) && set.size === 0) {
                    cleanups.get(key)?.()
                    cleanups.delete(key)
                }
            }
        },
        write: (key, value) => {
            contents.set(key, value)
            notify(key)
        },
        clear: (key) => {
            contents.delete(key)
            notify(key)
        },
    }
}
