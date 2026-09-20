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

const deliver = (element: Element, box: string) => {
    const entry = makeEntry(element)
    const instance = findInstance(element, box)
    act(() => instance?.callback([entry], instance as unknown as ResizeObserver))
    return entry
}

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
        renderHook(() => useResizeObserver(element, callback))

        const entry = deliver(element, "content-box")
        expect(callback).toHaveBeenCalledExactlyOnceWith(entry)
    })

    it("observes with the content box by default", () => {
        const element = document.createElement("div")
        renderHook(() => useResizeObserver(element, () => {}))

        expect(observeCalls).toEqual([[element, { box: "content-box" }]])
    })

    it("observes with the requested box", () => {
        const element = document.createElement("div")
        renderHook(() => useResizeObserver(element, () => {}, { box: "border-box" }))

        expect(observeCalls).toEqual([[element, { box: "border-box" }]])
    })

    it("observes nothing while the element is null", () => {
        renderHook(() => useResizeObserver(null, () => {}))

        expect(observeCalls).toEqual([])
    })

    it("observes an element that arrives after mount", () => {
        const element = document.createElement("div")
        const callback = vi.fn()
        const { rerender } = renderHook(
            ({ target }: { target: Element | null }) => useResizeObserver(target, callback),
            {
                initialProps: { target: null as Element | null },
            }
        )

        expect(observeCalls).toEqual([])

        rerender({ target: element })
        expect(observeCalls).toEqual([[element, { box: "content-box" }]])

        const entry = deliver(element, "content-box")
        expect(callback).toHaveBeenCalledExactlyOnceWith(entry)
    })

    it("moves the subscription when the element is replaced", () => {
        const first = document.createElement("div")
        const second = document.createElement("div")
        const callback = vi.fn()
        const { rerender } = renderHook(
            ({ target }: { target: Element | null }) => useResizeObserver(target, callback),
            {
                initialProps: { target: first as Element | null },
            }
        )

        rerender({ target: second })

        expect(unobserveCalls).toEqual([first])
        expect(observeCalls).toEqual([
            [first, { box: "content-box" }],
            [second, { box: "content-box" }],
        ])

        deliver(first, "content-box")
        expect(callback).not.toHaveBeenCalled()

        const entry = deliver(second, "content-box")
        expect(callback).toHaveBeenCalledExactlyOnceWith(entry)
    })

    it("tears the subscription down when the element becomes null", () => {
        const element = document.createElement("div")
        const callback = vi.fn()
        const { rerender } = renderHook(
            ({ target }: { target: Element | null }) => useResizeObserver(target, callback),
            {
                initialProps: { target: element as Element | null },
            }
        )

        rerender({ target: null })

        expect(unobserveCalls).toEqual([element])

        deliver(element, "content-box")
        expect(callback).not.toHaveBeenCalled()
    })

    it("re-observes under the new box when the box changes", () => {
        const element = document.createElement("div")
        const { rerender } = renderHook(
            ({ box }: { box: ResizeObserverBoxOptions }) => useResizeObserver(element, () => {}, { box }),
            { initialProps: { box: "content-box" as ResizeObserverBoxOptions } }
        )

        rerender({ box: "border-box" })

        expect(unobserveCalls).toEqual([element])
        expect(observeCalls).toEqual([
            [element, { box: "content-box" }],
            [element, { box: "border-box" }],
        ])
    })

    it("keeps the subscription while only the callback identity changes", () => {
        const element = document.createElement("div")
        const first = vi.fn()
        const second = vi.fn()
        const { rerender } = renderHook(
            ({ callback }: { callback: (entry: ResizeObserverEntry) => void }) => useResizeObserver(element, callback),
            { initialProps: { callback: first as (entry: ResizeObserverEntry) => void } }
        )

        rerender({ callback: second })

        expect(observeCalls).toEqual([[element, { box: "content-box" }]])
        expect(unobserveCalls).toEqual([])

        const entry = deliver(element, "content-box")
        expect(first).not.toHaveBeenCalled()
        expect(second).toHaveBeenCalledExactlyOnceWith(entry)
    })

    it("shares one observe call for the same element and box", () => {
        const element = document.createElement("div")
        renderHook(() => {
            useResizeObserver(element, () => {})
            useResizeObserver(element, () => {})
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
            useResizeObserver(element, () => {})
            useResizeObserver(element, () => {}, { box: "border-box" })
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
            useResizeObserver(first, () => {})
            useResizeObserver(second, () => {})
        })

        expect(observeCalls).toEqual([
            [first, { box: "content-box" }],
            [second, { box: "content-box" }],
        ])
        expect(findInstance(first, "content-box")).toBe(findInstance(second, "content-box"))
    })

    it("unobserves only when the last subscriber for the element unmounts", () => {
        const element = document.createElement("div")
        const first = renderHook(() => useResizeObserver(element, () => {}))
        const second = renderHook(() => useResizeObserver(element, () => {}))

        first.unmount()
        expect(unobserveCalls).toEqual([])

        second.unmount()
        expect(unobserveCalls).toEqual([element])
    })
})
