import { renderHook } from "@testing-library/react"
import { useDebounceCallback } from "../packages/react-toolkit/src/index.js"

describe("useDebounceCallback", () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it("collapses rapid calls into one trailing invocation with the last args", () => {
        const callback = vi.fn()
        const { result } = renderHook(() => useDebounceCallback(callback, 200))

        result.current("first")
        result.current("second")
        result.current("third")
        expect(callback).not.toHaveBeenCalled()

        vi.advanceTimersByTime(200)
        expect(callback).toHaveBeenCalledExactlyOnceWith("third")
    })

    it("invokes the latest callback from a rerender mid-window", () => {
        const stale = vi.fn()
        const fresh = vi.fn()
        const { result, rerender } = renderHook(({ callback }) => useDebounceCallback(callback, 200), {
            initialProps: { callback: stale as (value: string) => void },
        })

        result.current("value")
        rerender({ callback: fresh })

        vi.advanceTimersByTime(200)
        expect(stale).not.toHaveBeenCalled()
        expect(fresh).toHaveBeenCalledExactlyOnceWith("value")
    })

    it("keeps a stable identity across rerenders with the same wait and options", () => {
        const { result, rerender } = renderHook(() => useDebounceCallback(() => {}, 200, { edges: ["trailing"] }))
        const first = result.current

        rerender()
        expect(result.current).toBe(first)
    })

    it("cancels the pending call on unmount", () => {
        const callback = vi.fn()
        const { result, unmount } = renderHook(() => useDebounceCallback(callback, 200))

        result.current("value")
        unmount()

        vi.advanceTimersByTime(1000)
        expect(callback).not.toHaveBeenCalled()
    })
})
