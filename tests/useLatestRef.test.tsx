import { renderHook } from "@testing-library/react"
import { useLatestRef } from "../packages/react-toolkit/src/index.js"

describe("useLatestRef", () => {
    it("holds the latest value after re-render", () => {
        const { result, rerender } = renderHook(({ value }) => useLatestRef(value), {
            initialProps: { value: "first" },
        })
        expect(result.current.current).toBe("first")
        rerender({ value: "second" })
        expect(result.current.current).toBe("second")
    })

    it("keeps a stable ref object identity", () => {
        const { result, rerender } = renderHook(({ value }) => useLatestRef(value), {
            initialProps: { value: 1 },
        })
        const first = result.current
        rerender({ value: 2 })
        expect(result.current).toBe(first)
    })
})
