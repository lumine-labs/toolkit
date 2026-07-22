import { maskString } from "../packages/toolkit/src/index.js"

describe("maskString", () => {
    it("masks all but the last four characters by default", () => {
        expect(maskString("1234567890")).toBe("******7890")
    })

    it("respects custom visible and char options", () => {
        expect(maskString("1234567890", { visible: 2, char: "#" })).toBe("########90")
    })

    it("fully masks values at or under the visible length at constant length", () => {
        expect(maskString("123", { visible: 4 })).toBe("****")
        expect(maskString("1234", { visible: 4 })).toBe("****")
    })

    it("returns an empty string for an empty value", () => {
        expect(maskString("")).toBe("")
    })
})
