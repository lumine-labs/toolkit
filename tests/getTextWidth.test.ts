import { getTextWidth } from "../packages/toolkit/src/index.js"

// The module caches its canvas context, so the no-context case must run first:
// a null getContext result is not cached and the next call tries again.
describe("getTextWidth", () => {
    it("returns 0 when no 2D context is available", () => {
        const spy = vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null)
        expect(getTextWidth("hello", "16px Arial")).toBe(0)
        spy.mockRestore()
    })

    it("measures text width and reuses a single shared context", () => {
        const fakeContext = {
            font: "",
            measureText: vi.fn((text: string) => ({ width: text.length * 7 })),
        }
        const spy = vi
            .spyOn(HTMLCanvasElement.prototype, "getContext")
            .mockReturnValue(fakeContext as unknown as CanvasRenderingContext2D)

        expect(getTextWidth("hello", "16px Arial")).toBe(35)
        expect(getTextWidth("hi", "20px serif")).toBe(14)

        expect(spy).toHaveBeenCalledTimes(1)
        expect(fakeContext.font).toBe("20px serif")
        spy.mockRestore()
    })
})
