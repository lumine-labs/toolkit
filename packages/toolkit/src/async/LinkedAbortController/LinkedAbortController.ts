export class LinkedAbortController extends AbortController {
    constructor(...abortSignals: (AbortSignal | undefined)[]) {
        super()
        this.link(...abortSignals)
    }

    link(...abortSignals: (AbortSignal | undefined)[]) {
        abortSignals.forEach((abortSignal) => {
            if (!abortSignal) return

            // An already-aborted signal never fires "abort" — propagate immediately.
            if (abortSignal.aborted) {
                this.abort(abortSignal.reason)
                return
            }

            abortSignal.addEventListener("abort", () => {
                this.abort(abortSignal.reason)
            })
        })
    }
}
