import { isIFrame } from "../packages/toolkit/src/index.js"

describe("isIFrame", () => {
    afterEach(() => {
        vi.unstubAllGlobals()
    })

    it("returns false when self and top are the same window", () => {
        expect(isIFrame()).toBe(false)
    })

    it("returns true when top is a different window", () => {
        vi.stubGlobal("top", {})
        expect(isIFrame()).toBe(true)
    })
})
