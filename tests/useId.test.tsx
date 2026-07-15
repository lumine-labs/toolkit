import { render, renderHook } from "@testing-library/react"
import { makeUseId, useId } from "../packages/react-hooks/src/index.js"

describe("useId", () => {
    it("returns a stable id across re-renders", () => {
        const { result, rerender } = renderHook(() => useId())
        const first = result.current
        rerender()
        expect(result.current).toBe(first)
    })

    it("returns unique ids for sibling components", () => {
        const ids: string[] = []
        const Probe = () => {
            ids.push(useId())
            return null
        }
        render(
            <>
                <Probe />
                <Probe />
            </>
        )
        expect(ids).toHaveLength(2)
        expect(ids[0]).not.toBe(ids[1])
    })

    it("uses the default prefix", () => {
        const { result } = renderHook(() => useId())
        expect(result.current).toMatch(/^lumen-/)
    })

    it("returns the deterministic id when provided", () => {
        const { result } = renderHook(() => useId("my-id"))
        expect(result.current).toBe("my-id")
    })

    it("produces querySelector-safe ids", () => {
        const { result } = renderHook(() => useId())
        expect(result.current).toMatch(/^[a-zA-Z][a-zA-Z0-9_-]*$/)
        expect(() => document.querySelector(`#${result.current}`)).not.toThrow()
    })
})

describe("makeUseId", () => {
    it("applies a custom prefix", () => {
        const useAcmeId = makeUseId("acme")
        const { result } = renderHook(() => useAcmeId())
        expect(result.current).toMatch(/^acme-/)
    })
})
