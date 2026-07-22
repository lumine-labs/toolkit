import { castDataPropToBoolean } from "../packages/react-toolkit/src/index.js"

describe("castDataPropToBoolean", () => {
    it('casts the string "true" to true', () => {
        expect(castDataPropToBoolean("true")).toBe(true)
    })

    it('casts the string "false" to false', () => {
        expect(castDataPropToBoolean("false")).toBe(false)
    })

    it("returns undefined when the prop is absent", () => {
        expect(castDataPropToBoolean(undefined)).toBeUndefined()
    })

    it("passes through a real boolean true", () => {
        expect(castDataPropToBoolean(true)).toBe(true)
    })
})
