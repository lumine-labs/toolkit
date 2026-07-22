import { render, waitFor } from "@testing-library/react"
import { useFloatingSizeCapture } from "../packages/react-toolkit/src/floating/index.js"

class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
}

const Probe = () => {
    const { refs } = useFloatingSizeCapture("trigger")
    return (
        <>
            <button ref={refs.setReference}>reference</button>
            <div ref={refs.setFloating}>floating</div>
        </>
    )
}

describe("useFloatingSizeCapture", () => {
    beforeAll(() => {
        vi.stubGlobal("ResizeObserver", ResizeObserverStub)
    })

    afterAll(() => {
        vi.unstubAllGlobals()
    })

    it("writes the reference dimensions as CSS variables on the floating element", async () => {
        const { getByText } = render(<Probe />)
        const floating = getByText("floating")

        await waitFor(() => {
            expect(floating.style.getPropertyValue("--trigger-width")).toBe("0px")
            expect(floating.style.getPropertyValue("--trigger-height")).toBe("0px")
        })
    })
})
