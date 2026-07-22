import { act, renderHook } from "@testing-library/react"
import { useControllableState } from "../packages/react-toolkit/src/index.js"

describe("useControllableState", () => {
    describe("uncontrolled", () => {
        it("starts at defaultValue and updates via setValue, calling onChange", () => {
            const onChange = vi.fn()
            const { result } = renderHook(() => useControllableState({ defaultValue: 1, onChange }))
            expect(result.current[0]).toBe(1)

            act(() => result.current[1](2))
            expect(result.current[0]).toBe(2)
            expect(onChange).toHaveBeenCalledExactlyOnceWith(2)
        })

        it("resolves a function updater against the current value", () => {
            const { result } = renderHook(() => useControllableState({ defaultValue: 1 }))
            act(() => result.current[1]((previous) => previous + 1))
            expect(result.current[0]).toBe(2)
        })
    })

    describe("controlled", () => {
        it("returns the value prop and does not change it via setValue, but calls onChange", () => {
            const onChange = vi.fn()
            const { result } = renderHook(() => useControllableState({ value: 5, defaultValue: 1, onChange }))
            expect(result.current[0]).toBe(5)

            act(() => result.current[1](7))
            expect(result.current[0]).toBe(5)
            expect(onChange).toHaveBeenCalledExactlyOnceWith(7)
        })

        it("resolves a function updater against the controlled value", () => {
            const onChange = vi.fn()
            const { result } = renderHook(() => useControllableState({ value: 5, defaultValue: 1, onChange }))

            act(() => result.current[1]((previous) => previous + 1))
            expect(result.current[0]).toBe(5)
            expect(onChange).toHaveBeenCalledExactlyOnceWith(6)
        })
    })
})
