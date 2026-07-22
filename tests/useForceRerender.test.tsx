import { act, renderHook } from "@testing-library/react"
import { useForceRerender } from "../packages/react-toolkit/src/index.js"

describe("useForceRerender", () => {
    it("forces a rerender and increments the key", () => {
        let renders = 0
        const { result } = renderHook(() => {
            renders += 1
            return useForceRerender()
        })
        const rendersBefore = renders
        const keyBefore = result.current.rerenderKey

        act(() => result.current.rerender())

        expect(renders).toBe(rendersBefore + 1)
        expect(result.current.rerenderKey).toBe(keyBefore + 1)
    })

    it("keeps the rerender function identity stable", () => {
        const { result } = renderHook(() => useForceRerender())
        const rerender = result.current.rerender
        act(() => result.current.rerender())
        expect(result.current.rerender).toBe(rerender)
    })
})
