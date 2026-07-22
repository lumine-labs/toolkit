import { act, renderHook } from "@testing-library/react"
import { useResizeObserver } from "../packages/react-toolkit/src/index.js"

// The registry behind useResizeObserver caches one observer per box type for
// the module's lifetime, so the instances (and their callbacks) persist across
// this file's tests; per-test call logs are reset in beforeEach.
let observeCalls: [Element, ResizeObserverOptions | undefined][] = []
let unobserveCalls: Element[] = []

class MockResizeObserver {
    static instances: MockResizeObserver[] = []

    observed: [Element, ResizeObserverOptions | undefined][] = []

    constructor(readonly callback: ResizeObserverCallback) {
        MockResizeObserver.instances.push(this)
    }

    observe = (element: Element, options?: ResizeObserverOptions) => {
        this.observed.push([element, options])
        observeCalls.push([element, options])
    }

    unobserve = (element: Element) => {
        unobserveCalls.push(element)
    }

    disconnect = () => {}
}

const findInstance = (element: Element, box: string) =>
    MockResizeObserver.instances.find((instance) =>
        instance.observed.some(([observed, options]) => observed === element && options?.box === box)
    )

const makeEntry = (target: Element) => ({ target }) as unknown as ResizeObserverEntry

beforeEach(() => {
    observeCalls = []
    unobserveCalls = []
    vi.stubGlobal("ResizeObserver", MockResizeObserver)
})

afterEach(() => {
    vi.unstubAllGlobals()
})

describe("useResizeObserver", () => {
    it("delivers entries for the observed element to the callback", () => {
        const element = document.createElement("div")
        const callback = vi.fn()
        renderHook(() => useResizeObserver({ current: element }, callback))

        const entry = makeEntry(element)
        const instance = findInstance(element, "content-box")
        act(() => instance?.callback([entry], instance as unknown as ResizeObserver))
        expect(callback).toHaveBeenCalledExactlyOnceWith(entry)
    })

    it("observes with the content box by default", () => {
        const element = document.createElement("div")
        renderHook(() => useResizeObserver({ current: element }, () => {}))

        expect(observeCalls).toEqual([[element, { box: "content-box" }]])
    })

    it("observes with the requested box", () => {
        const element = document.createElement("div")
        renderHook(() => useResizeObserver({ current: element }, () => {}, { box: "border-box" }))

        expect(observeCalls).toEqual([[element, { box: "border-box" }]])
    })

    it("shares one observe call for the same element and box", () => {
        const element = document.createElement("div")
        renderHook(() => {
            useResizeObserver({ current: element }, () => {})
            useResizeObserver({ current: element }, () => {})
        })

        expect(observeCalls).toEqual([[element, { box: "content-box" }]])
        const owners = MockResizeObserver.instances.filter((instance) =>
            instance.observed.some(([observed]) => observed === element)
        )
        expect(owners).toHaveLength(1)
    })

    it("uses distinct observers for the same element under different boxes", () => {
        const element = document.createElement("div")
        renderHook(() => {
            useResizeObserver({ current: element }, () => {})
            useResizeObserver({ current: element }, () => {}, { box: "border-box" })
        })

        expect(observeCalls).toEqual([
            [element, { box: "content-box" }],
            [element, { box: "border-box" }],
        ])
        expect(findInstance(element, "content-box")).not.toBe(findInstance(element, "border-box"))
    })

    it("observes each distinct element once on the shared observer", () => {
        const first = document.createElement("div")
        const second = document.createElement("div")
        renderHook(() => {
            useResizeObserver({ current: first }, () => {})
            useResizeObserver({ current: second }, () => {})
        })

        expect(observeCalls).toEqual([
            [first, { box: "content-box" }],
            [second, { box: "content-box" }],
        ])
        expect(findInstance(first, "content-box")).toBe(findInstance(second, "content-box"))
    })

    it("unobserves only when the last subscriber for the element unmounts", () => {
        const element = document.createElement("div")
        const first = renderHook(() => useResizeObserver({ current: element }, () => {}))
        const second = renderHook(() => useResizeObserver({ current: element }, () => {}))

        first.unmount()
        expect(unobserveCalls).toEqual([])

        second.unmount()
        expect(unobserveCalls).toEqual([element])
    })
})
