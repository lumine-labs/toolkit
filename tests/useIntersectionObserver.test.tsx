import { act, renderHook } from "@testing-library/react"
import { useIntersectionObserver } from "../packages/react-toolkit/src/index.js"

class MockIntersectionObserver {
    static instances: MockIntersectionObserver[] = []

    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()

    constructor(
        private readonly callback: IntersectionObserverCallback,
        readonly options?: IntersectionObserverInit
    ) {
        MockIntersectionObserver.instances.push(this)
    }

    trigger(entries: IntersectionObserverEntry[]) {
        this.callback(entries, this as unknown as IntersectionObserver)
    }
}

beforeEach(() => {
    MockIntersectionObserver.instances = []
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver)
})

afterEach(() => {
    vi.unstubAllGlobals()
})

describe("useIntersectionObserver", () => {
    it("delivers entries to the callback on trigger", () => {
        const element = document.createElement("div")
        const callback = vi.fn()
        renderHook(() => useIntersectionObserver({ current: element }, callback))

        const entry = { target: element, isIntersecting: true } as unknown as IntersectionObserverEntry
        act(() => MockIntersectionObserver.instances[0].trigger([entry]))
        expect(callback).toHaveBeenCalledExactlyOnceWith(entry)
    })

    it("creates the observer with the given rootMargin and threshold", () => {
        const element = document.createElement("div")
        renderHook(() =>
            useIntersectionObserver({ current: element }, () => {}, { rootMargin: "10px", threshold: [0, 0.5] })
        )

        const observer = MockIntersectionObserver.instances[0]
        expect(observer.options?.rootMargin).toBe("10px")
        expect(observer.options?.threshold).toEqual([0, 0.5])
        expect(observer.observe).toHaveBeenCalledWith(element)
    })

    it("disconnects on unmount", () => {
        const element = document.createElement("div")
        const { unmount } = renderHook(() => useIntersectionObserver({ current: element }, () => {}))

        unmount()
        expect(MockIntersectionObserver.instances[0].disconnect).toHaveBeenCalledTimes(1)
    })

    it("constructs no observer for a null ref", () => {
        renderHook(() => useIntersectionObserver({ current: null }, () => {}))
        expect(MockIntersectionObserver.instances).toHaveLength(0)
    })
})
