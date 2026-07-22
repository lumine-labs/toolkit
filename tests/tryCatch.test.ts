import { tc } from "../packages/toolkit/src/index.js"

// Pins the es-toolkit attempt contract adopted by tc: error-first tuples,
// thrown values passed through raw (no normalization).
describe("tc", () => {
    describe("sync", () => {
        it("returns [null, value] on success", () => {
            const [error, value] = tc.sync(() => 42)
            expect(error).toBeNull()
            expect(value).toBe(42)
        })

        it("returns [error, null] on throw", () => {
            const failure = new Error("nope")
            const [error, value] = tc.sync(() => {
                throw failure
            })
            expect(error).toBe(failure)
            expect(value).toBeNull()
        })

        it("passes a thrown non-Error through raw", () => {
            const [error, value] = tc.sync(() => {
                throw "string failure"
            })
            expect(error).toBe("string failure")
            expect(value).toBeNull()
        })
    })

    describe("async", () => {
        it("returns [null, value] on success", async () => {
            const [error, value] = await tc.async(async () => "ok")
            expect(error).toBeNull()
            expect(value).toBe("ok")
        })

        it("returns [error, null] on rejection, raw", async () => {
            const [error, value] = await tc.async(async () => {
                throw "async raw"
            })
            expect(error).toBe("async raw")
            expect(value).toBeNull()
        })
    })

    describe("syncSafe", () => {
        it("returns the value on success", () => {
            expect(tc.syncSafe(() => 1)).toBe(1)
        })

        it("passes the raw error to onError when fn throws", () => {
            const onError = vi.fn()
            tc.syncSafe(() => {
                throw "string failure"
            }, onError)
            expect(onError).toHaveBeenCalledExactlyOnceWith("string failure")
        })

        it("does not call onError on success", () => {
            const onError = vi.fn()
            expect(tc.syncSafe(() => 1, onError)).toBe(1)
            expect(onError).not.toHaveBeenCalled()
        })

        it("swallows the error when onError is omitted", () => {
            expect(
                tc.syncSafe(() => {
                    throw new Error("x")
                })
            ).toBeUndefined()
        })
    })

    describe("asyncSafe", () => {
        it("passes the raw error to onError when fn rejects", async () => {
            const onError = vi.fn()
            await tc.asyncSafe(async () => {
                throw "string failure"
            }, onError)
            expect(onError).toHaveBeenCalledExactlyOnceWith("string failure")
        })

        it("does not call onError on success", async () => {
            const onError = vi.fn()
            await expect(tc.asyncSafe(async () => "ok", onError)).resolves.toBe("ok")
            expect(onError).not.toHaveBeenCalled()
        })

        it("swallows the error when onError is omitted", async () => {
            await expect(
                tc.asyncSafe(async () => {
                    throw new Error("x")
                })
            ).resolves.toBeUndefined()
        })
    })
})
