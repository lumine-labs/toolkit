import { renderHook } from "@testing-library/react"
import { useSizeCapture } from "../packages/react-toolkit/src/index.js"

// The registry behind useSizeCapture caches one observer per box type for the
// module's lifetime; this file only exercises the default border box, so the
// single captured callback persists across its tests.
let registryCallback: ResizeObserverCallback | undefined
let unobserveCalls: Element[] = []

class MockResizeObserver {
    constructor(callback: ResizeObserverCallback) {
        registryCallback = callback
    }

    observe = () => {}

    unobserve = (element: Element) => {
        unobserveCalls.push(element)
    }

    disconnect = () => {}
}

const trigger = (element: Element, width: number, height: number) => {
    registryCallback?.(
        [
            {
                target: element,
                borderBoxSize: [{ inlineSize: width, blockSize: height }],
            } as unknown as ResizeObserverEntry,
        ],
        {} as ResizeObserver
    )
}

beforeEach(() => {
    unobserveCalls = []
    vi.stubGlobal("ResizeObserver", MockResizeObserver)
})

afterEach(() => {
    vi.unstubAllGlobals()
})

describe("useSizeCapture", () => {
    it("writes the source size onto the target element as CSS variables", () => {
        const source = document.createElement("div")
        const target = document.createElement("div")

        const { result } = renderHook(() => useSizeCapture("addon"))
        result.current.setTarget(target)
        result.current.setSource(source)

        trigger(source, 120, 40)
        expect(target.style.getPropertyValue("--addon-width")).toBe("120px")
        expect(target.style.getPropertyValue("--addon-height")).toBe("40px")
    })

    it("applies the known size immediately when the target element attaches later", () => {
        const source = document.createElement("div")
        const target = document.createElement("div")

        const { result } = renderHook(() => useSizeCapture("addon"))
        result.current.setSource(source)
        trigger(source, 80, 24)

        result.current.setTarget(target)
        expect(target.style.getPropertyValue("--addon-width")).toBe("80px")
        expect(target.style.getPropertyValue("--addon-height")).toBe("24px")
    })

    it("stops updating after the source detaches", () => {
        const source = document.createElement("div")
        const target = document.createElement("div")

        const { result } = renderHook(() => useSizeCapture("addon"))
        result.current.setTarget(target)
        result.current.setSource(source)
        trigger(source, 120, 40)

        result.current.setSource(null)
        expect(unobserveCalls).toEqual([source])

        trigger(source, 999, 999)
        expect(target.style.getPropertyValue("--addon-width")).toBe("120px")
        expect(target.style.getPropertyValue("--addon-height")).toBe("40px")
    })

    it("never re-renders on size updates", () => {
        const source = document.createElement("div")
        const target = document.createElement("div")

        let renders = 0
        const { result } = renderHook(() => {
            renders += 1
            return useSizeCapture("addon")
        })
        result.current.setTarget(target)
        result.current.setSource(source)

        trigger(source, 120, 40)
        trigger(source, 130, 50)
        trigger(source, 140, 60)

        expect(renders).toBe(1)
        expect(target.style.getPropertyValue("--addon-width")).toBe("140px")
    })
})
