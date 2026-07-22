// A custom comparison for shallowEqual. Consulted for the whole pair first,
// then per value (with its key). Return a boolean to decide that comparison,
// or undefined to fall back to the default `Object.is` behaviour.
export type ShallowEqualComparator = (a: unknown, b: unknown, key?: string) => boolean | undefined

// Shallow structural equality (one level deep).
//
// Without a comparator: true when a and b are the same by `Object.is`, or are
// non-null objects with identical own enumerable keys whose values are each
// `Object.is`-equal.
//
// With a comparator: it decides the whole-pair comparison first, then each
// value; wherever it returns undefined, the default `Object.is` check applies.
export const shallowEqual = <T>(a: T, b: T, compare?: ShallowEqualComparator): boolean => {
    if (compare) {
        const result = compare(a, b)
        if (result !== undefined) return result
    }

    if (Object.is(a, b)) return true

    if (typeof a !== "object" || a === null || typeof b !== "object" || b === null) {
        return false
    }

    const aRecord = a as Record<string, unknown>
    const bRecord = b as Record<string, unknown>

    const aKeys = Object.keys(aRecord)
    const bKeys = Object.keys(bRecord)
    if (aKeys.length !== bKeys.length) return false

    for (const key of aKeys) {
        if (!Object.hasOwn(bRecord, key)) return false

        const valueA = aRecord[key]
        const valueB = bRecord[key]

        const result = compare ? compare(valueA, valueB, key) : undefined
        if (result === false || (result === undefined && !Object.is(valueA, valueB))) {
            return false
        }
    }

    return true
}
