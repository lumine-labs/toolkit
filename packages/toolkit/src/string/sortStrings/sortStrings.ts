export function sortStrings(
    strings: string[],
    options: {
        ignoreCase?: boolean
        locale?: string | string[]
        direction?: "asc" | "desc"
    } = {}
): string[] {
    const { ignoreCase = true, locale = "en", direction = "asc" } = options

    return [...strings].sort((a, b) => {
        const compareA = ignoreCase ? a.toLowerCase() : a
        const compareB = ignoreCase ? b.toLowerCase() : b

        const result = compareA.localeCompare(compareB, locale)
        return direction === "asc" ? result : -result
    })
}
