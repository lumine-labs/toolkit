import { shallowEqual } from "../packages/toolkit/src/index.js"

describe("shallowEqual", () => {
    it("returns true for the same reference", () => {
        const obj = { a: 1 }
        expect(shallowEqual(obj, obj)).toBe(true)
    })

    it("compares primitives with Object.is semantics", () => {
        expect(shallowEqual(1, 1)).toBe(true)
        expect(shallowEqual("x", "x")).toBe(true)
        expect(shallowEqual(1, 2)).toBe(false)
        expect(shallowEqual(NaN, NaN)).toBe(true)
        expect(shallowEqual(0, -0)).toBe(false)
    })

    it("returns true for objects with identical own key/value pairs", () => {
        expect(shallowEqual({ a: 1, b: "two" }, { a: 1, b: "two" })).toBe(true)
    })

    it("returns false when a value differs", () => {
        expect(shallowEqual({ a: 1, b: 2 }, { a: 1, b: 3 })).toBe(false)
    })

    it("returns false when key counts differ", () => {
        expect(shallowEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false)
        expect(shallowEqual({ a: 1, b: 2 }, { a: 1 })).toBe(false)
    })

    it("returns false for a same-count key mismatch", () => {
        expect(shallowEqual({ a: 1 }, { b: 1 })).toBe(false)
    })

    it("compares only one level deep", () => {
        const nested = { x: 1 }
        expect(shallowEqual({ n: nested }, { n: nested })).toBe(true)
        expect(shallowEqual({ n: { x: 1 } }, { n: { x: 1 } })).toBe(false)
    })

    it("handles null operands", () => {
        expect(shallowEqual(null, null)).toBe(true)
        expect(shallowEqual(null, {})).toBe(false)
        expect(shallowEqual({}, null)).toBe(false)
    })

    it("compares arrays shallowly", () => {
        expect(shallowEqual([1, 2, 3], [1, 2, 3])).toBe(true)
        expect(shallowEqual([1, 2], [2, 1])).toBe(false)
    })

    describe("with a comparator", () => {
        it("lets the comparator decide the whole pair when it returns a boolean", () => {
            expect(shallowEqual({ a: 1 }, { a: 2 }, () => true)).toBe(true)
            expect(shallowEqual({ a: 1 }, { a: 1 }, () => false)).toBe(false)
        })

        it("falls back to the default when the comparator returns undefined", () => {
            const compare = () => undefined
            expect(shallowEqual({ a: 1 }, { a: 1 }, compare)).toBe(true)
            expect(shallowEqual({ a: 1 }, { a: 2 }, compare)).toBe(false)
        })

        it("consults the comparator per value with the key", () => {
            const seen: string[] = []
            const compare = (_a: unknown, _b: unknown, key?: string) => {
                if (key !== undefined) seen.push(key)
                return undefined
            }
            shallowEqual({ a: 1, b: 2 }, { a: 1, b: 2 }, compare)
            expect(seen).toEqual(["a", "b"])
        })

        it("can deep-compare a chosen key while staying shallow elsewhere", () => {
            const compare = (a: unknown, b: unknown, key?: string) =>
                key === "n" ? JSON.stringify(a) === JSON.stringify(b) : undefined
            expect(shallowEqual({ n: { x: 1 } }, { n: { x: 1 } }, compare)).toBe(true)
            expect(shallowEqual({ n: { x: 1 } }, { n: { x: 2 } }, compare)).toBe(false)
        })

        it("treats a per-value false as not equal", () => {
            const compare = (_a: unknown, _b: unknown, key?: string) => (key === "a" ? false : undefined)
            expect(shallowEqual({ a: 1 }, { a: 1 }, compare)).toBe(false)
        })
    })
})
