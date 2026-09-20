import { act, render } from "@testing-library/react"
import { useState } from "react"
import { useElementSize } from "../packages/react-toolkit/src/index.js"

let unobserveCalls: Element[] = []

class MockResizeObserver {
    static instances: MockResizeObserver[] = []

    observed: [Element, ResizeObserverOptions | undefined][] = []

    constructor(readonly callback: ResizeObserverCallback) {
        MockResizeObserver.instances.push(this)
    }

    observe = (element: Element, options?: ResizeObserverOptions) => {
        this.observed.push([element, options])
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

const trigger = (element: Element, box: string, entry: Partial<ResizeObserverEntry>) => {
    const instance = findInstance(element, box)
    act(() =>
        instance?.callback(
            [{ target: element, ...entry } as ResizeObserverEntry],
            instance as unknown as ResizeObserver
        )
    )
}

const boxSize = (inlineSize: number, blockSize: number) =>
    [{ inlineSize, blockSize }] as unknown as readonly ResizeObserverSize[]

type ProbeProps = {
    box?: ResizeObserverBoxOptions
    attached?: boolean
    variant?: string
}

// The reported size is rendered outside the observed element so it stays
// readable while the element itself is detached.
let renders = 0
const Probe = ({ box, attached = true, variant = "first" }: ProbeProps) => {
    renders += 1
    const [element, setElement] = useState<HTMLDivElement | null>(null)
    const size = useElementSize(element, box ? { box } : undefined)
    return (
        <>
            <span data-testid="size">{size ? `${size.width}x${size.height}` : "none"}</span>
            {attached ? <div key={variant} ref={setElement} data-testid="el" /> : null}
        </>
    )
}

beforeEach(() => {
    renders = 0
    unobserveCalls = []
    vi.stubGlobal("ResizeObserver", MockResizeObserver)
})

afterEach(() => {
    vi.unstubAllGlobals()
})

describe("useElementSize", () => {
    it("is undefined before the element has been measured", () => {
        const { getByTestId } = render(<Probe />)
        expect(getByTestId("size").textContent).toBe("none")
    })

    it("updates from contentBoxSize when the observed element resizes", () => {
        const { getByTestId } = render(<Probe />)

        trigger(getByTestId("el"), "content-box", { contentBoxSize: boxSize(120, 40) })
        expect(getByTestId("size").textContent).toBe("120x40")
    })

    it("reads borderBoxSize when the border box is requested", () => {
        const { getByTestId } = render(<Probe box="border-box" />)

        trigger(getByTestId("el"), "border-box", { borderBoxSize: boxSize(144, 56) })
        expect(getByTestId("size").textContent).toBe("144x56")
    })

    it("falls back to contentRect when the box-size arrays are missing", () => {
        const { getByTestId } = render(<Probe />)

        trigger(getByTestId("el"), "content-box", { contentRect: { width: 90, height: 30 } as DOMRectReadOnly })
        expect(getByTestId("size").textContent).toBe("90x30")
    })

    it("commits a first measurement of zero by zero", () => {
        const { getByTestId } = render(<Probe />)

        trigger(getByTestId("el"), "content-box", { contentBoxSize: boxSize(0, 0) })
        expect(getByTestId("size").textContent).toBe("0x0")
    })

    it("keeps the same state for an identical size report", () => {
        const { getByTestId } = render(<Probe />)
        const element = getByTestId("el")

        trigger(element, "content-box", { contentBoxSize: boxSize(120, 40) })
        const rendersAfterChange = renders

        trigger(element, "content-box", { contentBoxSize: boxSize(120, 40) })
        expect(getByTestId("size").textContent).toBe("120x40")
        // React may render once to evaluate the updater, but the bailout must
        // prevent any further render cascade.
        expect(renders).toBeLessThanOrEqual(rendersAfterChange + 1)
    })

    it("observes an element that mounts after the hook", () => {
        const { getByTestId, queryByTestId, rerender } = render(<Probe attached={false} />)
        expect(queryByTestId("el")).toBeNull()

        rerender(<Probe attached />)

        trigger(getByTestId("el"), "content-box", { contentBoxSize: boxSize(120, 40) })
        expect(getByTestId("size").textContent).toBe("120x40")
    })

    it("moves the subscription when the observed element is replaced", () => {
        const { getByTestId, rerender } = render(<Probe />)
        const first = getByTestId("el")
        trigger(first, "content-box", { contentBoxSize: boxSize(120, 40) })

        rerender(<Probe variant="second" />)
        const second = getByTestId("el")
        expect(second).not.toBe(first)
        expect(unobserveCalls).toEqual([first])

        trigger(first, "content-box", { contentBoxSize: boxSize(999, 999) })
        expect(getByTestId("size").textContent).toBe("120x40")

        trigger(second, "content-box", { contentBoxSize: boxSize(80, 24) })
        expect(getByTestId("size").textContent).toBe("80x24")
    })

    it("goes back to undefined when the element detaches", () => {
        const { getByTestId, rerender } = render(<Probe />)
        const element = getByTestId("el")
        trigger(element, "content-box", { contentBoxSize: boxSize(120, 40) })
        expect(getByTestId("size").textContent).toBe("120x40")

        rerender(<Probe attached={false} />)
        expect(getByTestId("size").textContent).toBe("none")
        expect(unobserveCalls).toEqual([element])
    })

    it("unsubscribes when the element detaches", () => {
        const { getByTestId, unmount } = render(<Probe />)
        const element = getByTestId("el")

        unmount()
        expect(unobserveCalls).toEqual([element])
    })
})
