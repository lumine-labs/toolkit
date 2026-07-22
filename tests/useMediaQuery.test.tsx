import { act, render, renderHook } from "@testing-library/react"
import { renderToString } from "react-dom/server"
import { useMediaQuery } from "../packages/react-toolkit/src/index.js"

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

describe("useMediaQuery", () => {
    it("returns the current match state on mount", () => {
        const { created } = installMatchMedia()
        const { result } = renderHook(() => useMediaQuery("(min-width: 600px)"))
        expect(result.current).toBe(false)
        expect(listening(created)).toHaveLength(1)
    })

    it("updates when the media query changes", () => {
        const { created } = installMatchMedia()
        const { result } = renderHook(() => useMediaQuery("(min-width: 600px)"))
        act(() => listening(created)[0].dispatch(true))
        expect(result.current).toBe(true)
        act(() => listening(created)[0].dispatch(false))
        expect(result.current).toBe(false)
    })

    it("shares a single listener between consumers of the same query", () => {
        const { created } = installMatchMedia()
        const values: boolean[] = []
        const Probe = () => {
            values.push(useMediaQuery("(min-width: 600px)"))
            return null
        }
        render(
            <>
                <Probe />
                <Probe />
            </>
        )
        expect(listening(created)).toHaveLength(1)

        values.length = 0
        act(() => listening(created)[0].dispatch(true))
        expect(values).toEqual([true, true])
    })

    it("uses independent listeners for different queries", () => {
        const { created } = installMatchMedia()
        const first = renderHook(() => useMediaQuery("(min-width: 600px)"))
        const second = renderHook(() => useMediaQuery("(prefers-color-scheme: dark)"))
        expect(listening(created)).toHaveLength(2)

        act(() => listening(created)[1].dispatch(true))
        expect(first.result.current).toBe(false)
        expect(second.result.current).toBe(true)
    })

    it("removes the shared listener when the last consumer unmounts", () => {
        const { created } = installMatchMedia()
        const first = renderHook(() => useMediaQuery("(min-width: 600px)"))
        const second = renderHook(() => useMediaQuery("(min-width: 600px)"))
        const mql = listening(created)[0]

        first.unmount()
        expect(mql.listeners.size).toBe(1)

        second.unmount()
        expect(mql.listeners.size).toBe(0)
        expect(mql.removeEventListener).toHaveBeenCalledTimes(1)
    })

    it("resubscribes when the query changes", () => {
        const { created } = installMatchMedia()
        const { result, rerender } = renderHook(({ query }) => useMediaQuery(query), {
            initialProps: { query: "(min-width: 600px)" },
        })
        rerender({ query: "(min-width: 900px)" })
        const active = listening(created)
        expect(active).toHaveLength(1)
        expect(active[0].media).toBe("(min-width: 900px)")

        act(() => active[0].dispatch(true))
        expect(result.current).toBe(true)
    })

    it("renders defaultValue on the server without touching matchMedia", () => {
        const { impl } = installMatchMedia()
        const Probe = () => <span>{String(useMediaQuery("(min-width: 600px)", { defaultValue: true }))}</span>
        expect(renderToString(<Probe />)).toContain("true")
        expect(impl).not.toHaveBeenCalled()
    })
})
