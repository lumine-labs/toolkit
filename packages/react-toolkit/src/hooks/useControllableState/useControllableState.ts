import { useState, type SetStateAction } from "react"
import { useControlledSwitchWarning } from "../useControlledSwitchWarning/index.js"
import { useEvent } from "../useEvent/index.js"

type UseControllableStateOptions<T> = {
    value?: T
    defaultValue: T
    onChange?: (value: T) => void
}

// Controlled when `value` is provided, uncontrolled (internal state seeded by
// `defaultValue`) otherwise; `onChange` fires in both modes. Note: a function
// updater resolves against the value of the render that triggered it.
export const useControllableState = <T>({ value, defaultValue, onChange }: UseControllableStateOptions<T>) => {
    useControlledSwitchWarning(value)

    const [innerValue, setInnerValue] = useState(defaultValue)
    const isControlled = value !== undefined
    const actualValue = isControlled ? value : innerValue

    const setValue = useEvent((next: SetStateAction<T>) => {
        const resolved = typeof next === "function" ? (next as (previous: T) => T)(actualValue) : next
        if (!isControlled) {
            setInnerValue(resolved)
        }
        onChange?.(resolved)
    })

    return [actualValue, setValue] as const
}
