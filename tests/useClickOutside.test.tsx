import { fireEvent, render } from "@testing-library/react"
import { useRef } from "react"
import { useClickOutside } from "../packages/react-toolkit/src/index.js"

const Single = ({ onOutside, enabled }: { onOutside: (event: PointerEvent) => void; enabled?: boolean }) => {
    const ref = useRef<HTMLDivElement>(null)
    useClickOutside(ref, onOutside, { enabled })
    return <div ref={ref} data-testid="inside" />
}

const Pair = ({ onOutside }: { onOutside: (event: PointerEvent) => void }) => {
    const firstRef = useRef<HTMLDivElement>(null)
    const secondRef = useRef<HTMLDivElement>(null)
    useClickOutside([firstRef, secondRef], onOutside)
    return (
        <>
            <div ref={firstRef} data-testid="first" />
            <div ref={secondRef} data-testid="second" />
        </>
    )
}

describe("useClickOutside", () => {
    it("calls the handler with the event on pointerdown outside", () => {
        const handler = vi.fn()
        render(<Single onOutside={handler} />)

        fireEvent.pointerDown(document.body)
        expect(handler).toHaveBeenCalledTimes(1)
        expect(handler.mock.calls[0][0].type).toBe("pointerdown")
    })

    it("does not call the handler on pointerdown inside", () => {
        const handler = vi.fn()
        const { getByTestId } = render(<Single onOutside={handler} />)

        fireEvent.pointerDown(getByTestId("inside"))
        expect(handler).not.toHaveBeenCalled()
    })

    it("treats every ref in an array as inside", () => {
        const handler = vi.fn()
        const { getByTestId } = render(<Pair onOutside={handler} />)

        fireEvent.pointerDown(getByTestId("first"))
        fireEvent.pointerDown(getByTestId("second"))
        expect(handler).not.toHaveBeenCalled()

        fireEvent.pointerDown(document.body)
        expect(handler).toHaveBeenCalledTimes(1)
    })

    it("never calls the handler when disabled", () => {
        const handler = vi.fn()
        render(<Single onOutside={handler} enabled={false} />)

        fireEvent.pointerDown(document.body)
        expect(handler).not.toHaveBeenCalled()
    })

    it("listens to a custom event when configured", () => {
        const handler = vi.fn()
        const Custom = () => {
            const ref = useRef<HTMLDivElement>(null)
            useClickOutside(ref, handler, { event: "mousedown" })
            return <div ref={ref} data-testid="inside" />
        }
        render(<Custom />)

        fireEvent.pointerDown(document.body)
        expect(handler).not.toHaveBeenCalled()

        fireEvent.mouseDown(document.body)
        expect(handler).toHaveBeenCalledTimes(1)
        expect(handler.mock.calls[0][0].type).toBe("mousedown")
    })
})
