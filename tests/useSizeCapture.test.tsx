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

const readVariables = (target: HTMLElement, prefix = "addon") => [
    target.style.getPropertyValue(`--${prefix}-width`),
    target.style.getPropertyValue(`--${prefix}-height`),
]

type CaptureProps = {
    source: Element | null
    target: HTMLElement | null
    prefix?: string
}

const renderCapture = (initialProps: CaptureProps) =>
    renderHook(({ source, target, prefix = "addon" }: CaptureProps) => useSizeCapture({ source, target, prefix }), {
        initialProps,
    })

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

        renderCapture({ source, target })

        trigger(source, 120, 40)
        expect(readVariables(target)).toEqual(["120px", "40px"])
    })

    it("applies the known size when the target arrives after the source", () => {
        const source = document.createElement("div")
        const target = document.createElement("div")

        const { rerender } = renderCapture({ source, target: null })
        trigger(source, 80, 24)

        rerender({ source, target })
        expect(readVariables(target)).toEqual(["80px", "24px"])
    })

    it("applies the first measurement when the source arrives after the target", () => {
        const source = document.createElement("div")
        const target = document.createElement("div")

        const { rerender } = renderCapture({ source: null, target })
        expect(readVariables(target)).toEqual(["", ""])

        rerender({ source, target })
        trigger(source, 64, 16)
        expect(readVariables(target)).toEqual(["64px", "16px"])
    })

    it("moves the subscription when the source is replaced", () => {
        const first = document.createElement("div")
        const second = document.createElement("div")
        const target = document.createElement("div")

        const { rerender } = renderCapture({ source: first, target })
        trigger(first, 120, 40)

        rerender({ source: second, target })
        expect(unobserveCalls).toEqual([first])

        trigger(first, 999, 999)
        expect(readVariables(target)).toEqual(["120px", "40px"])

        trigger(second, 200, 60)
        expect(readVariables(target)).toEqual(["200px", "60px"])
    })

    it("re-applies the last size onto a replaced target", () => {
        const source = document.createElement("div")
        const first = document.createElement("div")
        const second = document.createElement("div")

        const { rerender } = renderCapture({ source, target: first })
        trigger(source, 120, 40)

        rerender({ source, target: second })
        expect(readVariables(second)).toEqual(["120px", "40px"])

        trigger(source, 130, 50)
        expect(readVariables(second)).toEqual(["130px", "50px"])
    })

    it("re-applies the last size under a new prefix", () => {
        const source = document.createElement("div")
        const target = document.createElement("div")

        const { rerender } = renderCapture({ source, target })
        trigger(source, 120, 40)

        rerender({ source, target, prefix: "trigger" })
        expect(readVariables(target, "trigger")).toEqual(["120px", "40px"])

        trigger(source, 130, 50)
        expect(readVariables(target, "trigger")).toEqual(["130px", "50px"])
    })

    it("stops updating after the source goes null", () => {
        const source = document.createElement("div")
        const target = document.createElement("div")

        const { rerender } = renderCapture({ source, target })
        trigger(source, 120, 40)

        rerender({ source: null, target })
        expect(unobserveCalls).toEqual([source])

        trigger(source, 999, 999)
        expect(readVariables(target)).toEqual(["120px", "40px"])
    })

    it("unsubscribes from the source on unmount", () => {
        const source = document.createElement("div")
        const target = document.createElement("div")

        const { unmount } = renderCapture({ source, target })
        unmount()

        expect(unobserveCalls).toEqual([source])
    })

    it("never re-renders on size updates", () => {
        const source = document.createElement("div")
        const target = document.createElement("div")

        let renders = 0
        renderHook(() => {
            renders += 1
            return useSizeCapture({ source, target, prefix: "addon" })
        })

        const rendersAfterAttach = renders
        trigger(source, 120, 40)
        trigger(source, 130, 50)
        trigger(source, 140, 60)

        expect(renders).toBe(rendersAfterAttach)
        expect(readVariables(target)).toEqual(["140px", "60px"])
    })
})
