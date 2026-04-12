import { useState } from "react"
import { useLazyRef } from "../useLazyRef"
import { useIsomorphicLayoutEffect } from "../useIsomorphicLayoutEffect"

type Queue = Map<string | number, () => void>

export const useScheduleLayoutEffect = () => {
    const [tick, setTick] = useState(0)
    const queue = useLazyRef<Queue>(() => new Map())

    useIsomorphicLayoutEffect(() => {
        queue.current.forEach((cb) => cb())
        queue.current = new Map()
    }, [tick])

    const schedule = (id: string | number, cb: () => void) => {
        queue.current.set(id, cb)
        setTick((tick) => tick + 1)
    }

    return schedule
}
