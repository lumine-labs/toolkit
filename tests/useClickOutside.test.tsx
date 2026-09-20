import { fireEvent, render } from "@testing-library/react"
import { useState } from "react"
import { useClickOutside } from "../packages/react-toolkit/src/index.js"

const Single = ({ onOutside, enabled }: { onOutside: (event: PointerEvent) => void; enabled?: boolean }) => {
    const [element, setElement] = useState<HTMLDivElement | null>(null)
    useClickOutside(element, onOutside, { enabled })
    return <div ref={setElement} data-testid="inside" />
}

// Drives the hook with elements owned by the test, so null, arrays and
// replacement can be exercised without rendering the elements through React.
const Probe = ({
    elements,
    onOutside,
}: {
    elements: HTMLElement | null | (HTMLElement | null)[]
    onOutside: (event: PointerEvent) => void
}) => {
    useClickOutside(elements, onOutside)
    return null
}

const Pair = ({ onOutside }: { onOutside: (event: PointerEvent) => void }) => {
    const [first, setFirst] = useState<HTMLDivElement | null>(null)
    const [second, setSecond] = useState<HTMLDivElement | null>(null)
    useClickOutside([first, second], onOutside)
    return (
        <>
            <div ref={setFirst} data-testid="first" />
            <div ref={setSecond} data-testid="second" />
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

    it("treats every element in an array as inside", () => {
        const handler = vi.fn()
        const { getByTestId } = render(<Pair onOutside={handler} />)

        fireEvent.pointerDown(getByTestId("first"))
        fireEvent.pointerDown(getByTestId("second"))
        expect(handler).not.toHaveBeenCalled()

        fireEvent.pointerDown(document.body)
        expect(handler).toHaveBeenCalledTimes(1)
    })

    it("ignores nulls among the elements", () => {
        const handler = vi.fn()
        const inside = document.createElement("div")
        document.body.appendChild(inside)
        render(<Probe elements={[null, inside, null]} onOutside={handler} />)

        fireEvent.pointerDown(inside)
        expect(handler).not.toHaveBeenCalled()

        fireEvent.pointerDown(document.body)
        expect(handler).toHaveBeenCalledTimes(1)

        inside.remove()
    })

    it("treats every click as outside while the element is null", () => {
        const handler = vi.fn()
        const inside = document.createElement("div")
        document.body.appendChild(inside)
        const { rerender } = render(<Probe elements={null} onOutside={handler} />)

        fireEvent.pointerDown(inside)
        expect(handler).toHaveBeenCalledTimes(1)

        rerender(<Probe elements={inside} onOutside={handler} />)
        fireEvent.pointerDown(inside)
        expect(handler).toHaveBeenCalledTimes(1)

        inside.remove()
    })

    it("follows the element when it is replaced", () => {
        const handler = vi.fn()
        const first = document.createElement("div")
        const second = document.createElement("div")
        document.body.append(first, second)
        const { rerender } = render(<Probe elements={first} onOutside={handler} />)

        rerender(<Probe elements={second} onOutside={handler} />)

        fireEvent.pointerDown(second)
        expect(handler).not.toHaveBeenCalled()

        fireEvent.pointerDown(first)
        expect(handler).toHaveBeenCalledTimes(1)

        first.remove()
        second.remove()
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
            const [element, setElement] = useState<HTMLDivElement | null>(null)
            useClickOutside(element, handler, { event: "mousedown" })
            return <div ref={setElement} data-testid="inside" />
        }
        render(<Custom />)

        fireEvent.pointerDown(document.body)
        expect(handler).not.toHaveBeenCalled()

        fireEvent.mouseDown(document.body)
        expect(handler).toHaveBeenCalledTimes(1)
        expect(handler.mock.calls[0][0].type).toBe("mousedown")
    })
})
