import { fireEvent, renderHook } from "@testing-library/react"
import { useEventListener } from "../packages/react-toolkit/src/index.js"

describe("useEventListener", () => {
    it("defaults to window and calls the listener when the event fires", () => {
        const listener = vi.fn()
        renderHook(() => useEventListener("resize", listener))

        fireEvent(window, new Event("resize"))
        expect(listener).toHaveBeenCalledTimes(1)
    })

    it("removes the listener on unmount", () => {
        const listener = vi.fn()
        const { unmount } = renderHook(() => useEventListener("resize", listener))

        unmount()
        fireEvent(window, new Event("resize"))
        expect(listener).not.toHaveBeenCalled()
    })

    it("attaches to the element behind a ref target", () => {
        const element = document.createElement("button")
        document.body.appendChild(element)
        const listener = vi.fn()
        renderHook(() => useEventListener("click", listener, { target: { current: element } }))

        fireEvent.click(element)
        expect(listener).toHaveBeenCalledTimes(1)

        element.remove()
    })

    it("attaches to a document target", () => {
        const listener = vi.fn()
        renderHook(() => useEventListener("visibilitychange", listener, { target: document }))

        fireEvent(document, new Event("visibilitychange"))
        expect(listener).toHaveBeenCalledTimes(1)
    })

    it("does nothing for a null target", () => {
        const listener = vi.fn()
        expect(() => renderHook(() => useEventListener("click", listener, { target: null }))).not.toThrow()

        fireEvent.click(document.body)
        expect(listener).not.toHaveBeenCalled()
    })

    it("uses the latest handler without re-subscribing", () => {
        const spy = vi.spyOn(window, "addEventListener")
        const first = vi.fn()
        const second = vi.fn()
        const { rerender } = renderHook(({ listener }) => useEventListener("resize", listener), {
            initialProps: { listener: first as (event: Event) => void },
        })

        fireEvent(window, new Event("resize"))
        expect(first).toHaveBeenCalledTimes(1)

        rerender({ listener: second })
        fireEvent(window, new Event("resize"))
        expect(first).toHaveBeenCalledTimes(1)
        expect(second).toHaveBeenCalledTimes(1)

        const resizeSubscriptions = spy.mock.calls.filter(([type]) => type === "resize")
        expect(resizeSubscriptions).toHaveLength(1)
        spy.mockRestore()
    })

    it("never attaches when enabled is false", () => {
        const spy = vi.spyOn(window, "addEventListener")
        const listener = vi.fn()
        renderHook(() => useEventListener("resize", listener, { enabled: false }))

        fireEvent(window, new Event("resize"))
        expect(listener).not.toHaveBeenCalled()
        expect(spy.mock.calls.filter(([type]) => type === "resize")).toHaveLength(0)
        spy.mockRestore()
    })

    it("attaches when enabled flips from false to true", () => {
        const listener = vi.fn()
        const { rerender } = renderHook(({ enabled }) => useEventListener("resize", listener, { enabled }), {
            initialProps: { enabled: false },
        })

        fireEvent(window, new Event("resize"))
        expect(listener).not.toHaveBeenCalled()

        rerender({ enabled: true })
        fireEvent(window, new Event("resize"))
        expect(listener).toHaveBeenCalledTimes(1)
    })

    it("passes capture through to addEventListener", () => {
        const element = document.createElement("button")
        const spy = vi.spyOn(element, "addEventListener")
        renderHook(() => useEventListener("click", () => {}, { target: { current: element }, capture: true }))

        expect(spy).toHaveBeenCalledTimes(1)
        expect(spy.mock.calls[0][2]).toMatchObject({ capture: true })
        spy.mockRestore()
    })
})
