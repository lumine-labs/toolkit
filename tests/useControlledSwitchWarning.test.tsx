import { renderHook } from "@testing-library/react"
import { useControlledSwitchWarning } from "../packages/react-toolkit/src/index.js"

const renderTracked = (initialValue: string | undefined) =>
    renderHook(({ value }) => useControlledSwitchWarning(value), {
        initialProps: { value: initialValue },
    })

describe("useControlledSwitchWarning", () => {
    const getWarnings = () => vi.mocked(console.error).mock.calls.map((call) => String(call[0]))

    beforeEach(() => {
        vi.spyOn(console, "error").mockImplementation(() => {})
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it("warns when a value switches from undefined to defined", () => {
        const { rerender } = renderTracked(undefined)
        rerender({ value: "defined" })
        expect(getWarnings()).toHaveLength(1)
        expect(getWarnings()[0]).toContain("an uncontrolled value to be controlled")
    })

    it("warns when a value switches from defined to undefined", () => {
        const { rerender } = renderTracked("defined")
        rerender({ value: undefined })
        expect(getWarnings()).toHaveLength(1)
        expect(getWarnings()[0]).toContain("a controlled value to be uncontrolled")
    })

    it("does not warn while the value stays defined", () => {
        const { rerender } = renderTracked("a")
        rerender({ value: "b" })
        rerender({ value: "c" })
        expect(console.error).not.toHaveBeenCalled()
    })

    it("does not warn while the value stays undefined", () => {
        const { rerender } = renderTracked(undefined)
        rerender({ value: undefined })
        expect(console.error).not.toHaveBeenCalled()
    })

    it("warns at most once per component", () => {
        const { rerender } = renderTracked(undefined)
        rerender({ value: "defined" })
        rerender({ value: undefined })
        rerender({ value: "defined" })
        expect(console.error).toHaveBeenCalledTimes(1)
    })
})
