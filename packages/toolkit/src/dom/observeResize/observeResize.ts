type ResizeCallback = (entry: ResizeObserverEntry) => void

type BoxRegistry = {
    observer: ResizeObserver
    callbacks: Map<Element, Set<ResizeCallback>>
}

// One lazy ResizeObserver per box type — an observer can't watch the same
// element under two box configs (re-observing replaces the registration), so
// sharing is keyed by box first, element second. Refcounted per element.
const registries = new Map<ResizeObserverBoxOptions, BoxRegistry>()

const getRegistry = (box: ResizeObserverBoxOptions) => {
    let registry = registries.get(box)
    if (registry) return registry

    const callbacks = new Map<Element, Set<ResizeCallback>>()
    const observer = new ResizeObserver((entries) => {
        entries.forEach((entry) => {
            const set = callbacks.get(entry.target)
            if (!set) return
            Array.from(set).forEach((callback) => callback(entry))
        })
    })

    registry = { observer, callbacks }
    registries.set(box, registry)
    return registry
}

export const observeResize = (
    element: Element,
    callback: ResizeCallback,
    box: ResizeObserverBoxOptions = "content-box"
) => {
    if (typeof ResizeObserver === "undefined") return () => {}

    const { observer, callbacks } = getRegistry(box)

    let set = callbacks.get(element)
    if (!set) {
        set = new Set()
        callbacks.set(element, set)
        observer.observe(element, { box })
    }
    set.add(callback)

    return () => {
        if (!set.delete(callback) || set.size > 0) return
        callbacks.delete(element)
        observer.unobserve(element)
    }
}

// Reads the entry size matching the observed box; falls back to contentRect
// (content box) when the box-size arrays aren't populated.
export const extractEntrySize = (entry: ResizeObserverEntry, box: ResizeObserverBoxOptions = "content-box") => {
    const boxSize =
        box === "border-box"
            ? entry.borderBoxSize
            : box === "device-pixel-content-box"
              ? entry.devicePixelContentBoxSize
              : entry.contentBoxSize

    if (boxSize?.length) {
        return { width: boxSize[0].inlineSize, height: boxSize[0].blockSize }
    }

    return { width: entry.contentRect.width, height: entry.contentRect.height }
}
