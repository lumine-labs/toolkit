import { useEffect, useRef } from "react"

// Mirrors React's controlled/uncontrolled input warning for custom components:
// a value that switches between undefined and defined across renders means the
// component is flipping between uncontrolled and controlled mode. Warns (like
// React does) rather than throwing, and at most once per component instance.
export const useControlledSwitchWarning = (value: unknown) => {
    const previousValue = useRef(value)
    const didWarn = useRef(false)

    useEffect(() => {
        const isDefined = value !== undefined
        const wasDefined = previousValue.current !== undefined
        previousValue.current = value

        if (didWarn.current || isDefined === wasDefined) {
            return
        }

        didWarn.current = true
        const direction = isDefined ? "an uncontrolled value to be controlled" : "a controlled value to be uncontrolled"
        console.error(
            `A component is changing ${direction}. ` +
                "This is likely caused by the value changing between undefined and a defined value, which should not happen. " +
                "Decide between using a controlled or uncontrolled element for the lifetime of the component. " +
                "More info: https://react.dev/link/controlled-components"
        )
    }, [value])
}
