import { useMediaQuery } from "../../hooks/useMediaQuery/index.js"

type UseBreakpointOptions = {
    defaultValue?: boolean
}

// Creates a breakpoint hook from a min-width map (px) — e.g. a Tailwind
// screens config. The resulting hook is true when the viewport is at least
// that breakpoint wide.
export const createBreakpointHook = <Breakpoint extends string>(breakpoints: Record<Breakpoint, number>) => {
    const useBreakpoint = (breakpoint: Breakpoint, { defaultValue = false }: UseBreakpointOptions = {}) => {
        return useMediaQuery(`(min-width: ${breakpoints[breakpoint]}px)`, { defaultValue })
    }
    return useBreakpoint
}
