import { sortStrings } from "../packages/toolkit/src/index.js"

describe("sortStrings", () => {
    it("sorts ascending by default", () => {
        expect(sortStrings(["banana", "apple", "cherry"])).toEqual(["apple", "banana", "cherry"])
    })

    it("sorts descending when direction is desc", () => {
        expect(sortStrings(["banana", "apple", "cherry"], { direction: "desc" })).toEqual(["cherry", "banana", "apple"])
    })

    it("treats case as equal by default (ignoreCase)", () => {
        expect(sortStrings(["A", "a"])).toEqual(["A", "a"])
    })

    it("distinguishes case when ignoreCase is false", () => {
        expect(sortStrings(["A", "a"], { ignoreCase: false })).toEqual(["a", "A"])
    })

    it("does not mutate the input array", () => {
        const input = ["banana", "apple"]
        sortStrings(input)
        expect(input).toEqual(["banana", "apple"])
    })
})
