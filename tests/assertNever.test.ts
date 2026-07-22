import { assertNever, Enum } from "../packages/toolkit/src/index.js"

const Kind = Enum({ A: "a", B: "b" })
type Kind = Enum<typeof Kind>

// Compile-level exhaustiveness: both members handled, so the default branch
// narrows `kind` to never and assertNever accepts it.
const label = (kind: Kind) => {
    switch (kind) {
        case Kind.A:
            return "first"
        case Kind.B:
            return "second"
        default:
            return assertNever(kind)
    }
}

describe("assertNever", () => {
    it("throws with the stringified value in the default message", () => {
        expect(() => assertNever("rogue" as never)).toThrow("Unexpected value: rogue")
    })

    it("honors a custom message", () => {
        expect(() => assertNever("rogue" as never, "custom failure")).toThrow("custom failure")
    })

    it("returns the correct branches for an exhaustively handled union", () => {
        expect(label(Kind.A)).toBe("first")
        expect(label(Kind.B)).toBe("second")
    })
})
