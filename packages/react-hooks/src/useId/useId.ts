import { useId as useReactId } from "react"

// React's useId is SSR/hydration-safe but its raw output contains delimiters
// (":" in React 18, "«»" in React 19) that break querySelector — strip
// everything that is not selector-safe.
const toSelectorSafe = (id: string) => id.replace(/[^a-zA-Z0-9_-]/g, "")

export const makeUseId = (prefix = "lumen") => {
    const useId = (deterministicId?: string) => {
        const reactId = toSelectorSafe(useReactId())
        return deterministicId || `${prefix}-${reactId}`
    }

    return useId
}

export const useId = makeUseId()
