import { createKeyedStore, type KeyedStore } from "@lumelabs/toolkit"
import { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore, type ReactNode } from "react"
import { useIsomorphicLayoutEffect } from "../../hooks/useIsomorphicLayoutEffect/index.js"

type SlotContext = Record<string, unknown>

// Renders one slot's content and subscribes to just that slot, so content
// updates re-render the outlet alone — never the Slots owner. That keeps
// unstable (per-render) slot children from feeding a re-render cycle.
const SlotOutlet = ({ store, name }: { store: KeyedStore<ReactNode>; name: string }) => {
    const subscribe = useCallback((listener: () => void) => store.watch(name, listener), [store, name])
    const content = useSyncExternalStore(
        subscribe,
        () => store.read(name) ?? null,
        () => null
    )
    return <>{content}</>
}

const emptyContext: SlotContext = Object.freeze({})

export const createSlots = <SlotNames extends string>(slotNames: SlotNames[]) => {
    type Slots = {
        [name in SlotNames]?: ReactNode
    }

    type SlotsContextValue = {
        store: KeyedStore<ReactNode>
        registerName: (name: SlotNames) => void
        unregisterName: (name: SlotNames) => void
        context: SlotContext
    }

    const SlotsContext = createContext<SlotsContextValue | null>(null)

    const Slots = ({
        context = emptyContext,
        children,
    }: {
        context?: SlotContext
        children: (slots: Slots) => ReactNode
    }) => {
        const [store] = useState(() => createKeyedStore<ReactNode>())
        const [activeNames, setActiveNames] = useState<ReadonlySet<SlotNames>>(() => new Set())

        const registerName = useCallback((name: SlotNames) => {
            setActiveNames((names) => (names.has(name) ? names : new Set(names).add(name)))
        }, [])

        const unregisterName = useCallback((name: SlotNames) => {
            setActiveNames((names) => {
                if (!names.has(name)) return names
                const next = new Set(names)
                next.delete(name)
                return next
            })
        }, [])

        // A slot becomes visible to the render prop when a Slot with that name
        // mounts; the content itself streams through the outlet.
        const slots = useMemo(() => {
            const result: Slots = {}
            slotNames.forEach((name) => {
                result[name] = activeNames.has(name) ? <SlotOutlet store={store} name={name} /> : null
            })
            return result
        }, [activeNames, store])

        const value = useMemo(
            () => ({ store, registerName, unregisterName, context }),
            [store, registerName, unregisterName, context]
        )

        return <SlotsContext.Provider value={value}>{children(slots)}</SlotsContext.Provider>
    }

    const Slot = ({
        name,
        children,
    }: {
        name: SlotNames
        children: ((context: SlotContext) => ReactNode) | ReactNode
    }) => {
        const slotsContext = useContext(SlotsContext)

        // Mount/unmount registration — deliberately independent of `children`,
        // so per-render children identity never touches the Slots owner state.
        useIsomorphicLayoutEffect(() => {
            if (!slotsContext) return
            slotsContext.registerName(name)
            return () => {
                slotsContext.store.clear(name)
                slotsContext.unregisterName(name)
            }
        }, [slotsContext, name])

        useIsomorphicLayoutEffect(() => {
            if (!slotsContext) return
            const { store, context } = slotsContext
            store.write(name, typeof children === "function" ? children(context) : children)
        }, [slotsContext, name, children])

        return null
    }

    return { Slots, Slot }
}
