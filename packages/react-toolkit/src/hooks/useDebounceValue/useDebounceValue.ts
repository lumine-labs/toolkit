import { useEffect, useState } from "react"
import { useDebounceCallback, type UseDebounceOptions } from "../useDebounceCallback/index.js"

// The input value, trailing `wait` ms behind rapid changes. Function values
// are safe (stored via an updater, never interpreted as one).
export const useDebounceValue = <T>(value: T, wait = 500, options?: UseDebounceOptions) => {
    // initializer wrap: a function-typed `value` must not be called eagerly
    const [debouncedValue, setDebouncedValue] = useState<T>(() => value)
    const update = useDebounceCallback((next: T) => setDebouncedValue(() => next), wait, options)

    useEffect(() => {
        update(value)
    }, [value, update])

    return debouncedValue
}
