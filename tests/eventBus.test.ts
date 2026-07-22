import { EventBus } from "../packages/toolkit/src/index.js"

describe("EventBus", () => {
    it("delivers the emitted payload to a handler", () => {
        const bus = new EventBus<{ ping: number }>()
        const handler = vi.fn()
        bus.on("ping", handler)

        bus.emit("ping", 42)
        expect(handler).toHaveBeenCalledExactlyOnceWith(42)
    })

    it("fires every handler subscribed to the event", () => {
        const bus = new EventBus()
        const first = vi.fn()
        const second = vi.fn()
        bus.on("event", first)
        bus.on("event", second)

        bus.emit("event", "payload")
        expect(first).toHaveBeenCalledExactlyOnceWith("payload")
        expect(second).toHaveBeenCalledExactlyOnceWith("payload")
    })

    it("unsubscribes via the disposer returned by on", () => {
        const bus = new EventBus()
        const handler = vi.fn()
        const dispose = bus.on("event", handler)

        dispose()
        bus.emit("event", "payload")
        expect(handler).not.toHaveBeenCalled()
    })

    it("off with a handler removes just that handler", () => {
        const bus = new EventBus()
        const removed = vi.fn()
        const kept = vi.fn()
        bus.on("event", removed)
        bus.on("event", kept)

        bus.off("event", removed)
        bus.emit("event", "payload")
        expect(removed).not.toHaveBeenCalled()
        expect(kept).toHaveBeenCalledTimes(1)
    })

    it("off without a handler clears all handlers for the event", () => {
        const bus = new EventBus()
        const first = vi.fn()
        const second = vi.fn()
        bus.on("event", first)
        bus.on("event", second)

        bus.off("event")
        bus.emit("event", "payload")
        expect(first).not.toHaveBeenCalled()
        expect(second).not.toHaveBeenCalled()
    })

    it("keeps events isolated", () => {
        const bus = new EventBus()
        const handlerB = vi.fn()
        bus.on("b", handlerB)

        bus.emit("a", "payload")
        expect(handlerB).not.toHaveBeenCalled()
    })

    it("once fires exactly once across two emits", () => {
        const bus = new EventBus()
        const handler = vi.fn()
        bus.once("event", handler)

        bus.emit("event", "first")
        bus.emit("event", "second")
        expect(handler).toHaveBeenCalledExactlyOnceWith("first")
    })

    it("once disposer prevents the call when invoked before any emit", () => {
        const bus = new EventBus()
        const handler = vi.fn()
        const dispose = bus.once("event", handler)

        dispose()
        bus.emit("event", "payload")
        expect(handler).not.toHaveBeenCalled()
    })

    it("once with a throwing handler still runs at most once", () => {
        const bus = new EventBus()
        const handler = vi.fn(() => {
            throw new Error("boom")
        })
        bus.once("event", handler)

        expect(() => bus.emit("event", "first")).toThrow("boom")
        bus.emit("event", "second")
        expect(handler).toHaveBeenCalledTimes(1)
    })

    it("does not deliver the in-flight emit to a handler subscribed during it", () => {
        const bus = new EventBus()
        const late = vi.fn()
        bus.on("event", () => {
            bus.on("event", late)
        })

        bus.emit("event", "first")
        expect(late).not.toHaveBeenCalled()

        bus.emit("event", "second")
        expect(late).toHaveBeenCalledExactlyOnceWith("second")
    })

    it("infers typed payloads from the Events map", () => {
        const bus = new EventBus<{ ping: number }>()
        let received: number | undefined
        bus.on("ping", (payload) => {
            received = payload
        })

        bus.emit("ping", 1)
        expect(received).toBe(1)
    })
})
