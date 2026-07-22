import { LinkedAbortController } from "../packages/toolkit/src/index.js"

describe("LinkedAbortController", () => {
    it("aborts when a linked signal aborts and propagates the reason", () => {
        const parent = new AbortController()
        const linked = new LinkedAbortController(parent.signal)
        expect(linked.signal.aborted).toBe(false)

        const reason = new Error("boom")
        parent.abort(reason)

        expect(linked.signal.aborted).toBe(true)
        expect(linked.signal.reason).toBe(reason)
    })

    it("aborts on the first of multiple parents to abort", () => {
        const a = new AbortController()
        const b = new AbortController()
        const linked = new LinkedAbortController(a.signal, b.signal)

        a.abort(new Error("first"))
        b.abort(new Error("second"))

        expect(linked.signal.aborted).toBe(true)
        expect((linked.signal.reason as Error).message).toBe("first")
    })

    it("ignores undefined signals", () => {
        const parent = new AbortController()
        const linked = new LinkedAbortController(undefined, parent.signal, undefined)
        expect(linked.signal.aborted).toBe(false)

        parent.abort()
        expect(linked.signal.aborted).toBe(true)
    })

    it("aborts immediately when constructed from an already-aborted signal", () => {
        const parent = new AbortController()
        const reason = new Error("already")
        parent.abort(reason)

        const linked = new LinkedAbortController(parent.signal)
        expect(linked.signal.aborted).toBe(true)
        expect(linked.signal.reason).toBe(reason)
    })
})
