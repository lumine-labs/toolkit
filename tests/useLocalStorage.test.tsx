import { act, renderHook } from "@testing-library/react"
import { useLocalStorage } from "../packages/react-toolkit/src/index.js"

beforeEach(() => {
    localStorage.clear()
})

describe("useLocalStorage", () => {
    it("returns the initial value when the key is missing", () => {
        const { result } = renderHook(() => useLocalStorage("missing-key", "initial"))
        expect(result.current[0]).toBe("initial")
    })

    it("returns the parsed stored value when present", () => {
        localStorage.setItem("seeded-key", JSON.stringify("stored"))
        const { result } = renderHook(() => useLocalStorage("seeded-key", "initial"))
        expect(result.current[0]).toBe("stored")
    })

    it("persists via setValue and updates the hook", () => {
        const { result } = renderHook(() => useLocalStorage("set-key", "initial"))

        act(() => result.current[1]("next"))
        expect(result.current[0]).toBe("next")
        expect(localStorage.getItem("set-key")).toBe(JSON.stringify("next"))
    })

    it("resolves a function updater against the stored value", () => {
        localStorage.setItem("updater-key", JSON.stringify(1))
        const { result } = renderHook(() => useLocalStorage("updater-key", 0))

        act(() => result.current[1]((previous) => previous + 1))
        expect(result.current[0]).toBe(2)
        expect(localStorage.getItem("updater-key")).toBe(JSON.stringify(2))
    })

    it("remove clears storage and falls back to the initial value", () => {
        const { result } = renderHook(() => useLocalStorage("remove-key", "initial"))

        act(() => result.current[1]("next"))
        act(() => result.current[2]())
        expect(result.current[0]).toBe("initial")
        expect(localStorage.getItem("remove-key")).toBeNull()
    })

    it("keeps two hooks with the same key in sync within the tab", () => {
        const { result } = renderHook(() => ({
            first: useLocalStorage("sync-key", "initial"),
            second: useLocalStorage("sync-key", "initial"),
        }))

        act(() => result.current.first[1]("updated"))
        expect(result.current.second[0]).toBe("updated")
    })

    it("updates from a cross-tab storage event", () => {
        const { result } = renderHook(() => useLocalStorage("cross-key", "initial"))

        act(() => {
            window.dispatchEvent(new StorageEvent("storage", { key: "cross-key", newValue: JSON.stringify("remote") }))
        })
        expect(result.current[0]).toBe("remote")
    })

    it("falls back to the initial value for corrupted JSON", () => {
        localStorage.setItem("corrupt-key", "{not json")
        const { result } = renderHook(() => useLocalStorage("corrupt-key", "initial"))
        expect(result.current[0]).toBe("initial")
    })
})
