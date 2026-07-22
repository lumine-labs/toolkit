import { fireEvent, render } from "@testing-library/react"
import { useState } from "react"
import { createSlots } from "../packages/react-toolkit/src/index.js"

describe("createSlots", () => {
    it("renders slot content where the render prop places it", () => {
        const { Slots, Slot } = createSlots(["header", "footer"])
        const { getByTestId } = render(
            <Slots>
                {(slots) => (
                    <div>
                        <div data-testid="head">{slots.header}</div>
                        <div data-testid="foot">{slots.footer}</div>
                        <Slot name="header">Hello</Slot>
                        <Slot name="footer">Bye</Slot>
                    </div>
                )}
            </Slots>
        )

        expect(getByTestId("head").textContent).toBe("Hello")
        expect(getByTestId("foot").textContent).toBe("Bye")
    })

    it("removes slot content when the Slot unmounts", () => {
        const { Slots, Slot } = createSlots(["header"])
        const Wrapper = ({ show }: { show: boolean }) => (
            <Slots>
                {(slots) => (
                    <div>
                        <div data-testid="head">{slots.header}</div>
                        {show && <Slot name="header">Hello</Slot>}
                    </div>
                )}
            </Slots>
        )

        const { getByTestId, rerender } = render(<Wrapper show={true} />)
        expect(getByTestId("head").textContent).toBe("Hello")

        rerender(<Wrapper show={false} />)
        expect(getByTestId("head").textContent).toBe("")
    })

    it("renders an empty slot when no Slot children are provided", () => {
        const { Slots } = createSlots(["header"])
        const { getByTestId } = render(<Slots>{(slots) => <div data-testid="head">{slots.header}</div>}</Slots>)
        expect(getByTestId("head").textContent).toBe("")
    })

    it("updates slot content when it changes", () => {
        const { Slots, Slot } = createSlots(["header"])
        const Wrapper = () => {
            const [count, setCount] = useState(0)
            return (
                <div>
                    <button onClick={() => setCount((c) => c + 1)}>bump</button>
                    <Slots>
                        {(slots) => (
                            <div>
                                <div data-testid="head">{slots.header}</div>
                                <Slot name="header">count: {count}</Slot>
                            </div>
                        )}
                    </Slots>
                </div>
            )
        }

        const { getByTestId, getByText } = render(<Wrapper />)
        expect(getByTestId("head").textContent).toBe("count: 0")

        fireEvent.click(getByText("bump"))
        expect(getByTestId("head").textContent).toBe("count: 1")
    })

    it("tolerates element children across re-renders", () => {
        const spy = vi.spyOn(console, "error").mockImplementation(() => {})
        const { Slots, Slot } = createSlots(["header"])
        const Wrapper = () => (
            <Slots>
                {(slots) => (
                    <div>
                        <div data-testid="head">{slots.header}</div>
                        <Slot name="header">
                            <span>panel</span>
                        </Slot>
                    </div>
                )}
            </Slots>
        )

        const { getByTestId, rerender } = render(<Wrapper />)
        rerender(<Wrapper />)
        rerender(<Wrapper />)
        rerender(<Wrapper />)

        expect(getByTestId("head").textContent).toBe("panel")
        expect(spy).not.toHaveBeenCalled()
        spy.mockRestore()
    })
})
