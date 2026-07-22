// True when running inside an iframe; some sandboxed/cross-origin setups make
// the window.top comparison throw, which still means "framed".
export const isIFrame = () => {
    try {
        return window.self !== window.top
    } catch {
        return true
    }
}
