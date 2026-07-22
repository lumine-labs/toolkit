import { useForceRerender } from "../useForceRerender/index.js"
import { useLazyRef } from "../useLazyRef/index.js"
import { useIsomorphicLayoutEffect } from "../useIsomorphicLayoutEffect/index.js"

type Queue = Map<string | number, () => void>

export const useScheduleLayoutEffect = () => {
    const { rerender, rerenderKey } = useForceRerender()
    const queue = useLazyRef<Queue>(() => new Map())

    useIsomorphicLayoutEffect(() => {
        queue.current.forEach((cb) => cb())
        queue.current = new Map()
    }, [rerenderKey])

    const schedule = (id: string | number, cb: () => void) => {
        queue.current.set(id, cb)
        rerender()
    }

    return schedule
}
