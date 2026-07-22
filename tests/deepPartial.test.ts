import { type DeepPartial } from "../packages/toolkit/src/index.js"

type Config = {
    server: {
        host: string
        port: number
    }
    flags: {
        verbose: boolean
    }
}

// Compile-level checks: DeepPartial makes every level optional while still
// rejecting wrong value types.
const empty: DeepPartial<Config> = {}
const partialBranch: DeepPartial<Config> = { server: { port: 8080 } }
// @ts-expect-error — port must stay a number even when partial
const wrongType: DeepPartial<Config> = { server: { port: "8080" } }

describe("DeepPartial", () => {
    it("accepts empty and partially nested objects at compile time", () => {
        expect(empty).toEqual({})
        expect(partialBranch.server?.port).toBe(8080)
        expect(wrongType).toBeDefined()
    })
})
