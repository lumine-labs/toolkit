import { render } from "@testing-library/react"
import { createRef } from "react"
import { mergeRefs } from "../packages/react-toolkit/src/index.js"

describe("mergeRefs", () => {
    it("sets ref objects and calls callback refs with the node", () => {
        const refObject = createRef<HTMLDivElement>()
        const callback = vi.fn()
        const { container } = render(<div ref={mergeRefs(refObject, callback)} />)
        expect(refObject.current).toBe(container.firstChild)
        expect(callback).toHaveBeenCalledWith(container.firstChild)
    })

    it("ignores null and undefined refs", () => {
        const refObject = createRef<HTMLDivElement>()
        expect(() => render(<div ref={mergeRefs(refObject, null, undefined)} />)).not.toThrow()
        expect(refObject.current).not.toBeNull()
    })

    it("sets refs to null on unmount", () => {
        const refObject = createRef<HTMLDivElement>()
        const received: unknown[] = []
        const callback = (node: HTMLDivElement | null) => {
            received.push(node)
        }
        const { unmount } = render(<div ref={mergeRefs(refObject, callback)} />)
        unmount()
        expect(refObject.current).toBeNull()
        expect(received[received.length - 1]).toBeNull()
    })

    it("runs a callback ref's cleanup instead of calling it with null", () => {
        const cleanup = vi.fn()
        const withCleanup = vi.fn(() => cleanup)
        const refObject = createRef<HTMLDivElement>()
        const { unmount } = render(<div ref={mergeRefs(withCleanup, refObject)} />)
        expect(withCleanup).toHaveBeenCalledTimes(1)
        unmount()
        expect(cleanup).toHaveBeenCalledTimes(1)
        expect(withCleanup).toHaveBeenCalledTimes(1)
        expect(refObject.current).toBeNull()
    })
})
