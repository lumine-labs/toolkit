// Casts a data-* attribute value ("true"/"false" as rendered in the DOM, or
// still a boolean inside a props object) to a boolean; undefined when absent.
export function castDataPropToBoolean(prop: unknown) {
    if (prop === undefined) return undefined
    return prop === "true" || prop === true
}
