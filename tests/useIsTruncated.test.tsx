import { act, render } from "@testing-library/react"
import { useIsTruncated } from "../packages/react-toolkit/src/index.js"

// The shared registry behind useIsTruncated caches one observer per box type
// for the module's lifetime; the captured callback persists across tests.
let registryCallback: ResizeObserverCallback | undefined
let observeCalls: [Element, ResizeObserverOptions | undefined][] = []
let unobserveCalls: Element[] = []

class MockResizeObserver {
    constructor(callback: ResizeObserverCallback) {
        registryCallback = callback
    }

    observe = (element: Element, options?: ResizeObserverOptions) => {
        observeCalls.push([element, options])
    }

    unobserve = (element: Element) => {
        unobserveCalls.push(element)
    }

    disconnect = () => {}
}

const trigger = (element: Element) => {
    act(() => registryCallback?.([{ target: element } as unknown as ResizeObserverEntry], {} as ResizeObserver))
}

let scrollHeight = 0
let clientHeight = 0

beforeEach(() => {
    observeCalls = []
    unobserveCalls = []
    vi.stubGlobal("ResizeObserver", MockResizeObserver)
    Object.defineProperty(HTMLElement.prototype, "scrollHeight", { configurable: true, get: () => scrollHeight })
    Object.defineProperty(HTMLElement.prototype, "clientHeight", { configurable: true, get: () => clientHeight })
})

afterEach(() => {
    vi.unstubAllGlobals()
    delete (HTMLElement.prototype as unknown as Record<string, unknown>)["scrollHeight"]
    delete (HTMLElement.prototype as unknown as Record<string, unknown>)["clientHeight"]
})

const Probe = () => {
    const { ref, isTruncated } = useIsTruncated<HTMLDivElement>()
    return <div ref={ref} data-testid="el" data-truncated={String(isTruncated)} />
}

describe("useIsTruncated", () => {
    it("measures on mount and reports truncation", () => {
        scrollHeight = 100
        clientHeight = 50
        const { getByTestId } = render(<Probe />)

        expect(getByTestId("el").dataset.truncated).toBe("true")
        expect(observeCalls).toEqual([[getByTestId("el"), { box: "content-box" }]])
    })

    it("measures on mount and reports no truncation for equal heights", () => {
        scrollHeight = 50
        clientHeight = 50
        const { getByTestId } = render(<Probe />)

        expect(getByTestId("el").dataset.truncated).toBe("false")
    })

    it("re-measures when the observer fires after a size change", () => {
        scrollHeight = 50
        clientHeight = 50
        const { getByTestId } = render(<Probe />)
        expect(getByTestId("el").dataset.truncated).toBe("false")

        scrollHeight = 100
        trigger(getByTestId("el"))
        expect(getByTestId("el").dataset.truncated).toBe("true")
    })

    it("stops observing on unmount", () => {
        scrollHeight = 100
        clientHeight = 50
        const { getByTestId, unmount } = render(<Probe />)
        const element = getByTestId("el")

        unmount()
        expect(unobserveCalls).toEqual([element])
    })
})
