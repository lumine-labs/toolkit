import { castNodeToBoolean } from "../packages/react-toolkit/src/index.js"

describe("castNodeToBoolean", () => {
    it("returns false for null, undefined, and false", () => {
        expect(castNodeToBoolean(null)).toBe(false)
        expect(castNodeToBoolean(undefined)).toBe(false)
        expect(castNodeToBoolean(false)).toBe(false)
    })

    it("returns false for whitespace-only strings", () => {
        expect(castNodeToBoolean("  ")).toBe(false)
    })

    it("returns true for non-empty strings", () => {
        expect(castNodeToBoolean("x")).toBe(true)
    })

    it("returns true for numbers including zero", () => {
        expect(castNodeToBoolean(0)).toBe(true)
    })

    it("returns true for a React element", () => {
        expect(castNodeToBoolean(<span />)).toBe(true)
    })

    it("returns true for an array containing a meaningful node", () => {
        expect(castNodeToBoolean(["  ", "x"])).toBe(true)
    })

    it("returns false for an empty array", () => {
        expect(castNodeToBoolean([])).toBe(false)
    })
})
