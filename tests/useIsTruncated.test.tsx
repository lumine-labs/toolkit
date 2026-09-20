import { act, render } from "@testing-library/react"
import { useState } from "react"
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

type ProbeProps = {
    attached?: boolean
    variant?: string
}

const Probe = ({ attached = true, variant = "first" }: ProbeProps) => {
    const [element, setElement] = useState<HTMLDivElement | null>(null)
    const isTruncated = useIsTruncated(element)
    if (!attached) return null
    return <div key={variant} ref={setElement} data-testid="el" data-truncated={String(isTruncated)} />
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

    it("reports the measurement without waiting for an observer delivery", () => {
        scrollHeight = 100
        clientHeight = 50
        const { getByTestId } = render(<Probe />)

        // the mock observer never delivers on its own, so a truncated reading
        // here can only come from the synchronous measure on attach
        expect(getByTestId("el").dataset.truncated).toBe("true")
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

    it("measures an element that arrives after mount", () => {
        scrollHeight = 100
        clientHeight = 50
        const { getByTestId, queryByTestId, rerender } = render(<Probe attached={false} />)
        expect(queryByTestId("el")).toBeNull()
        expect(observeCalls).toEqual([])

        rerender(<Probe attached />)
        const element = getByTestId("el")

        expect(element.dataset.truncated).toBe("true")
        expect(observeCalls).toEqual([[element, { box: "content-box" }]])
    })

    it("measures the replacement element when the observed one is swapped", () => {
        scrollHeight = 50
        clientHeight = 50
        const { getByTestId, rerender } = render(<Probe />)
        const first = getByTestId("el")
        expect(first.dataset.truncated).toBe("false")

        scrollHeight = 100
        rerender(<Probe variant="second" />)
        const second = getByTestId("el")
        expect(second).not.toBe(first)
        expect(second.dataset.truncated).toBe("true")
        expect(unobserveCalls).toEqual([first])
        expect(observeCalls).toEqual([
            [first, { box: "content-box" }],
            [second, { box: "content-box" }],
        ])

        scrollHeight = 50
        trigger(first)
        expect(second.dataset.truncated).toBe("true")
    })

    it("stops observing when the element goes away", () => {
        scrollHeight = 100
        clientHeight = 50
        const { getByTestId, rerender } = render(<Probe />)
        const element = getByTestId("el")

        rerender(<Probe attached={false} />)
        expect(unobserveCalls).toEqual([element])

        scrollHeight = 50
        expect(() => trigger(element)).not.toThrow()
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
