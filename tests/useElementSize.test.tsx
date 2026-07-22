import { act, render } from "@testing-library/react"
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

let renders = 0
const Probe = ({ box }: { box?: ResizeObserverBoxOptions }) => {
    renders += 1
    const { ref, width, height } = useElementSize<HTMLDivElement>(box ? { box } : undefined)
    return <div ref={ref} data-testid="el" data-size={`${width}x${height}`} />
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
    it("starts at zero width and height", () => {
        const { getByTestId } = render(<Probe />)
        expect(getByTestId("el").dataset.size).toBe("0x0")
    })

    it("updates from contentBoxSize when the observed element resizes", () => {
        const { getByTestId } = render(<Probe />)
        const element = getByTestId("el")

        trigger(element, "content-box", { contentBoxSize: boxSize(120, 40) })
        expect(element.dataset.size).toBe("120x40")
    })

    it("reads borderBoxSize when the border box is requested", () => {
        const { getByTestId } = render(<Probe box="border-box" />)
        const element = getByTestId("el")

        trigger(element, "border-box", { borderBoxSize: boxSize(144, 56) })
        expect(element.dataset.size).toBe("144x56")
    })

    it("falls back to contentRect when the box-size arrays are missing", () => {
        const { getByTestId } = render(<Probe />)
        const element = getByTestId("el")

        trigger(element, "content-box", { contentRect: { width: 90, height: 30 } as DOMRectReadOnly })
        expect(element.dataset.size).toBe("90x30")
    })

    it("keeps the same state for an identical size report", () => {
        const { getByTestId } = render(<Probe />)
        const element = getByTestId("el")

        trigger(element, "content-box", { contentBoxSize: boxSize(120, 40) })
        const rendersAfterChange = renders

        trigger(element, "content-box", { contentBoxSize: boxSize(120, 40) })
        expect(element.dataset.size).toBe("120x40")
        // React may render once to evaluate the updater, but the bailout must
        // prevent any further render cascade.
        expect(renders).toBeLessThanOrEqual(rendersAfterChange + 1)
    })

    it("unsubscribes when the element detaches", () => {
        const { getByTestId, unmount } = render(<Probe />)
        const element = getByTestId("el")

        unmount()
        expect(unobserveCalls).toEqual([element])
    })
})
