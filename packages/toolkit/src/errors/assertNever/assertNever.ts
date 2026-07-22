// Exhaustiveness guard: place in the default branch of a switch over a union —
// if every member is handled, the value narrows to never and this compiles;
// a newly added member turns every forgotten switch into a compile error.
export const assertNever = (value: never, message = `Unexpected value: ${String(value)}`): never => {
    throw new Error(message)
}
