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

const renderObserver = (initialProps: {
    target: Element | null
    callback?: (entry: IntersectionObserverEntry) => void
}) =>
    renderHook(
        ({
            target,
            callback = () => {},
        }: {
            target: Element | null
            callback?: (entry: IntersectionObserverEntry) => void
        }) => useIntersectionObserver(target, callback),
        { initialProps }
    )

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
        renderHook(() => useIntersectionObserver(element, callback))

        const entry = { target: element, isIntersecting: true } as unknown as IntersectionObserverEntry
        act(() => MockIntersectionObserver.instances[0].trigger([entry]))
        expect(callback).toHaveBeenCalledExactlyOnceWith(entry)
    })

    it("creates the observer with the given rootMargin and threshold", () => {
        const element = document.createElement("div")
        renderHook(() => useIntersectionObserver(element, () => {}, { rootMargin: "10px", threshold: [0, 0.5] }))

        const observer = MockIntersectionObserver.instances[0]
        expect(observer.options?.rootMargin).toBe("10px")
        expect(observer.options?.threshold).toEqual([0, 0.5])
        expect(observer.observe).toHaveBeenCalledWith(element)
    })

    it("passes a root element straight through and defaults to the viewport", () => {
        const element = document.createElement("div")
        const root = document.createElement("div")
        renderHook(() => useIntersectionObserver(element, () => {}, { root }))
        expect(MockIntersectionObserver.instances[0].options?.root).toBe(root)

        renderHook(() => useIntersectionObserver(element, () => {}))
        expect(MockIntersectionObserver.instances[1].options?.root).toBeNull()
    })

    it("keeps one observer when an inline threshold array is re-created", () => {
        const element = document.createElement("div")
        const { rerender } = renderHook(() => useIntersectionObserver(element, () => {}, { threshold: [0, 0.5] }))

        rerender()
        expect(MockIntersectionObserver.instances).toHaveLength(1)
    })

    it("disconnects on unmount", () => {
        const element = document.createElement("div")
        const { unmount } = renderHook(() => useIntersectionObserver(element, () => {}))

        unmount()
        expect(MockIntersectionObserver.instances[0].disconnect).toHaveBeenCalledTimes(1)
    })

    it("constructs no observer while the element is null", () => {
        renderObserver({ target: null })
        expect(MockIntersectionObserver.instances).toHaveLength(0)
    })

    it("observes an element that arrives after mount", () => {
        const element = document.createElement("div")
        const callback = vi.fn()
        const { rerender } = renderObserver({ target: null, callback })
        expect(MockIntersectionObserver.instances).toHaveLength(0)

        rerender({ target: element, callback })
        expect(MockIntersectionObserver.instances).toHaveLength(1)
        expect(MockIntersectionObserver.instances[0].observe).toHaveBeenCalledWith(element)
    })

    it("moves the observer when the element is replaced", () => {
        const first = document.createElement("div")
        const second = document.createElement("div")
        const { rerender } = renderObserver({ target: first })

        rerender({ target: second })

        expect(MockIntersectionObserver.instances).toHaveLength(2)
        expect(MockIntersectionObserver.instances[0].disconnect).toHaveBeenCalledTimes(1)
        expect(MockIntersectionObserver.instances[1].observe).toHaveBeenCalledWith(second)
    })

    it("disconnects when the element becomes null", () => {
        const element = document.createElement("div")
        const { rerender } = renderObserver({ target: element })

        rerender({ target: null })

        expect(MockIntersectionObserver.instances).toHaveLength(1)
        expect(MockIntersectionObserver.instances[0].disconnect).toHaveBeenCalledTimes(1)
    })
})
