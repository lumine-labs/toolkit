import { renderHook } from "@testing-library/react"
import { usePreviousRef } from "../packages/react-toolkit/src/index.js"

// The ref updates in an effect, so the previous value is what .current holds
// DURING render — capture it there rather than after commit.
const renderCapture = (initial: { value: unknown }) =>
    renderHook(
        ({ value }) => {
            const ref = usePreviousRef(value)
            return ref.current
        },
        { initialProps: initial }
    )

describe("usePreviousRef", () => {
    it("holds undefined during the first render", () => {
        const { result } = renderCapture({ value: 1 })
        expect(result.current).toBeUndefined()
    })

    it("holds the prior value during the next render", () => {
        const { result, rerender } = renderCapture({ value: 1 })

        rerender({ value: 2 })
        expect(result.current).toBe(1)
    })

    it("stays one step behind across multiple rerenders", () => {
        const { result, rerender } = renderCapture({ value: "a" })

        rerender({ value: "b" })
        expect(result.current).toBe("a")

        rerender({ value: "c" })
        expect(result.current).toBe("b")
    })
})
