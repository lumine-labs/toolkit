import { Enum } from "../packages/toolkit/src/index.js"

const Color = Enum({ Red: "red", Green: "green", Code: 3 })
type Color = Enum<typeof Color>

describe("Enum", () => {
    it("returns the same object reference", () => {
        const obj = { A: "a", B: "b" }
        expect(Enum(obj)).toBe(obj)
    })

    it("exposes keys, values, and entries", () => {
        expect(Enum.keys(Color)).toEqual(["Red", "Green", "Code"])
        expect(Enum.values(Color)).toEqual(["red", "green", 3])
        expect(Enum.entries(Color)).toEqual([
            ["Red", "red"],
            ["Green", "green"],
            ["Code", 3],
        ])
    })

    it("keyOf finds the key for a value", () => {
        expect(Enum.keyOf(Color, "green")).toBe("Green")
        expect(Enum.keyOf(Color, 3)).toBe("Code")
    })

    it("keyOf returns undefined for an unknown value", () => {
        expect(Enum.keyOf(Color, "purple" as Color)).toBeUndefined()
    })

    it("derives a type that accepts a member value", () => {
        const value: Color = Color.Red
        expect(value).toBe("red")
    })
})
