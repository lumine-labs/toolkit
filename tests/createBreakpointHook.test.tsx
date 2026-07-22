import { act, renderHook } from "@testing-library/react"
import { createBreakpointHook } from "../packages/react-toolkit/src/index.js"

class MockMediaQueryList {
    matches = false
    listeners = new Set<(event: { matches: boolean }) => void>()

    constructor(public media: string) {}

    addEventListener = vi.fn((_type: string, listener: (event: { matches: boolean }) => void) => {
        this.listeners.add(listener)
    })

    removeEventListener = vi.fn((_type: string, listener: (event: { matches: boolean }) => void) => {
        this.listeners.delete(listener)
    })

    dispatch(matches: boolean) {
        this.matches = matches
        this.listeners.forEach((listener) => listener({ matches }))
    }
}

const installMatchMedia = () => {
    const created: MockMediaQueryList[] = []
    const impl = vi.fn((query: string) => {
        const mql = new MockMediaQueryList(query)
        created.push(mql)
        return mql as unknown as MediaQueryList
    })
    vi.stubGlobal("matchMedia", impl)
    return { impl, created }
}

const listening = (created: MockMediaQueryList[]) => created.filter((mql) => mql.listeners.size > 0)

afterEach(() => {
    vi.unstubAllGlobals()
})

describe("createBreakpointHook", () => {
    it("builds the min-width query from the breakpoint map", () => {
        const { impl } = installMatchMedia()
        const useBreakpoint = createBreakpointHook({ sm: 640, md: 768 })

        const { result } = renderHook(() => useBreakpoint("md"))
        expect(impl).toHaveBeenCalledWith("(min-width: 768px)")
        expect(result.current).toBe(false)
    })

    it("responds to media query changes", () => {
        const { created } = installMatchMedia()
        const useBreakpoint = createBreakpointHook({ sm: 640, md: 768 })

        const { result } = renderHook(() => useBreakpoint("sm"))
        act(() => listening(created)[0].dispatch(true))
        expect(result.current).toBe(true)
    })
})
