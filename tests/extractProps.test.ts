import { extractProps } from "../packages/react-toolkit/src/index.js"

describe("extractProps", () => {
    it("splits props into extracted and remaining", () => {
        const { extracted, remaining } = extractProps({ a: 1, b: "two", c: true }, ["a", "c"])
        expect(extracted).toEqual({ a: 1, c: true })
        expect(remaining).toEqual({ b: "two" })
    })

    it("ignores keys that are not present", () => {
        const props: { a: number; b?: string } = { a: 1 }
        const { extracted, remaining } = extractProps(props, ["b"])
        expect(extracted).toEqual({})
        expect(remaining).toEqual({ a: 1 })
    })

    it("does not mutate the original props object", () => {
        const props = { a: 1, b: 2 }
        extractProps(props, ["a"])
        expect(props).toEqual({ a: 1, b: 2 })
    })
})
