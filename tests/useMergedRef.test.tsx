import { render, renderHook } from "@testing-library/react"
import { createRef } from "react"
import { useMergedRef } from "../packages/react-toolkit/src/index.js"

describe("useMergedRef", () => {
    it("merges refs onto the same node", () => {
        const a = createRef<HTMLDivElement>()
        const b = createRef<HTMLDivElement>()
        const Probe = () => <div ref={useMergedRef(a, b)} />
        const { container } = render(<Probe />)
        expect(a.current).toBe(container.firstChild)
        expect(b.current).toBe(container.firstChild)
    })

    it("keeps the merged ref stable across re-renders with the same refs", () => {
        const a = createRef<HTMLDivElement>()
        const { result, rerender } = renderHook(() => useMergedRef(a))
        const first = result.current
        rerender()
        expect(result.current).toBe(first)
    })
})
