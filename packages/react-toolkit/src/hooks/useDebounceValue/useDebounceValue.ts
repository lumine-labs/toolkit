import { useEffect, useState } from "react"
import { useDebounceCallback, type UseDebounceOptions } from "../useDebounceCallback/index.js"

export const useDebounceValue = <T>(value: T, wait = 500, options?: UseDebounceOptions) => {
    const [debouncedValue, setDebouncedValue] = useState<T>(() => value)
    const update = useDebounceCallback((next: T) => setDebouncedValue(() => next), wait, options)

    useEffect(() => {
        update(value)
    }, [value, update])

    return debouncedValue
}
