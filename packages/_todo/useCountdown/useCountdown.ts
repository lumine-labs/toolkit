import { useEffect, useRef, useState } from "react"
import { useEvent } from "../useEvent/index.js"

type UseCountdownOptions = {
    seconds?: number
    onComplete?: () => void
    startOnMount?: boolean
}

// Second-granularity countdown, optionally starting on mount. start(n)
// (re)starts from n seconds (defaults to the last total), reset() restarts
// from the last total, stop() halts in place. onComplete fires exactly once
// per run, when the count reaches zero.
export const useCountdown = ({ seconds = 0, onComplete, startOnMount = false }: UseCountdownOptions = {}) => {
    const [count, setCount] = useState(seconds)
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const totalRef = useRef(seconds)
    const remainingRef = useRef(seconds)

    const stop = useEvent(() => {
        if (intervalRef.current !== null) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
        }
    })

    const handleComplete = useEvent(() => onComplete?.())

    const start = useEvent((totalSeconds: number = totalRef.current) => {
        stop()
        totalRef.current = totalSeconds
        remainingRef.current = totalSeconds
        setCount(totalSeconds)

        if (totalSeconds <= 0) return

        intervalRef.current = setInterval(() => {
            remainingRef.current -= 1
            setCount(remainingRef.current)

            if (remainingRef.current <= 0) {
                stop()
                handleComplete()
            }
        }, 1000)
    })

    const reset = useEvent(() => start(totalRef.current))

    useEffect(() => {
        if (startOnMount) {
            start()
        }
        return stop
        // start/stop are stable useEvent identities; run on mount only
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return { count, start, stop, reset }
}
