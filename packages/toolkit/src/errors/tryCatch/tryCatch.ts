import { attempt, attemptAsync } from "es-toolkit"

// es-toolkit's attempt tuple, adopted wholesale: error-first, thrown value
// passed through raw — [null, value] on success, [error, null] on failure.
// (es-toolkit exports no name for the tuple, so we alias it in their
// vocabulary.) The "safe" variants swallow the error (optionally reporting
// it) and return just the value or undefined.
export type AttemptResult<T, E = unknown> = [null, T] | [E, null]

export const tc = {
    sync<T, E = unknown>(fn: () => T): AttemptResult<T, E> {
        return attempt<T, E>(fn)
    },

    async async<T, E = unknown>(fn: () => Promise<T>): Promise<AttemptResult<T, E>> {
        return attemptAsync<T, E>(fn)
    },

    syncSafe<T>(fn: () => T, onError?: (error: unknown) => void): T | undefined {
        const [error, value] = tc.sync(fn)
        if (error !== null) {
            onError?.(error)
            return undefined
        }
        return value as T
    },

    async asyncSafe<T>(fn: () => Promise<T>, onError?: (error: unknown) => void): Promise<T | undefined> {
        const [error, value] = await tc.async(fn)
        if (error !== null) {
            onError?.(error)
            return undefined
        }
        return value as T
    },
}
