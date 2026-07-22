import { act, renderHook } from "@testing-library/react"
import { useDebounceValue } from "../packages/react-toolkit/src/index.js"

describe("useDebounceValue", () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it("returns the initial value immediately", () => {
        const { result } = renderHook(() => useDebounceValue("initial", 200))
        expect(result.current).toBe("initial")
    })

    it("reflects a change after the wait elapses", () => {
        const { result, rerender } = renderHook(({ value }) => useDebounceValue(value, 200), {
            initialProps: { value: "initial" },
        })

        rerender({ value: "next" })
        expect(result.current).toBe("initial")

        act(() => vi.advanceTimersByTime(200))
        expect(result.current).toBe("next")
    })

    it("collapses rapid successive changes to the last value", () => {
        const { result, rerender } = renderHook(({ value }) => useDebounceValue(value, 200), {
            initialProps: { value: "a" },
        })

        rerender({ value: "b" })
        rerender({ value: "c" })
        rerender({ value: "d" })

        act(() => vi.advanceTimersByTime(200))
        expect(result.current).toBe("d")
    })

    it("stores function values without interpreting them as updaters", () => {
        const first = () => "first"
        const second = () => "second"
        const { result, rerender } = renderHook(({ value }) => useDebounceValue<() => string>(value, 200), {
            initialProps: { value: first },
        })
        expect(result.current).toBe(first)

        rerender({ value: second })
        act(() => vi.advanceTimersByTime(200))
        expect(result.current).toBe(second)
        expect(result.current()).toBe("second")
    })
})
