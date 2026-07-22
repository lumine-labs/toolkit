import { createKeyedStore } from "../packages/toolkit/src/index.js"

describe("createKeyedStore", () => {
    it("round-trips a written value", () => {
        const store = createKeyedStore<number>()
        store.write("a", 1)
        expect(store.read("a")).toBe(1)
    })

    it("returns undefined for an unknown key", () => {
        const store = createKeyedStore<number>()
        expect(store.read("missing")).toBeUndefined()
    })

    it("notifies a watcher on write and on clear", () => {
        const store = createKeyedStore<number>()
        const listener = vi.fn()
        store.watch("a", listener)

        store.write("a", 1)
        expect(listener).toHaveBeenCalledTimes(1)

        store.clear("a")
        expect(listener).toHaveBeenCalledTimes(2)
        expect(store.read("a")).toBeUndefined()
    })

    it("does not notify an unsubscribed watcher", () => {
        const store = createKeyedStore<number>()
        const listener = vi.fn()
        const unsubscribe = store.watch("a", listener)

        unsubscribe()
        store.write("a", 1)
        expect(listener).not.toHaveBeenCalled()
    })

    it("keeps keys isolated", () => {
        const store = createKeyedStore<number>()
        const listenerB = vi.fn()
        store.watch("b", listenerB)

        store.write("a", 1)
        expect(listenerB).not.toHaveBeenCalled()
    })

    it("runs onActive once per key activation and its cleanup once on deactivation", () => {
        const cleanup = vi.fn()
        const onActive = vi.fn(() => cleanup)
        const store = createKeyedStore<number>({ onActive })

        const first = store.watch("a", () => {})
        expect(onActive).toHaveBeenCalledTimes(1)
        expect(onActive).toHaveBeenCalledWith("a")

        const second = store.watch("a", () => {})
        expect(onActive).toHaveBeenCalledTimes(1)

        first()
        expect(cleanup).not.toHaveBeenCalled()

        second()
        expect(cleanup).toHaveBeenCalledTimes(1)
    })

    it("does not double-run cleanup when the same watcher unsubscribes twice", () => {
        const cleanup = vi.fn()
        const store = createKeyedStore<number>({ onActive: () => cleanup })

        const listener = () => {}
        const other = store.watch("a", () => {})
        const unsubscribe = store.watch("a", listener)

        unsubscribe()
        unsubscribe()
        expect(cleanup).not.toHaveBeenCalled()

        other()
        expect(cleanup).toHaveBeenCalledTimes(1)
    })
})
