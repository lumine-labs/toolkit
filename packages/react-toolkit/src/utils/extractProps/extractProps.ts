export const extractProps = <T extends Record<string, any>, K extends keyof T>(props: T, extractKeys: readonly K[]) => {
    const extracted = {} as Pick<T, K>
    const remaining = { ...props }

    for (const key of extractKeys) {
        if (key in remaining) {
            extracted[key] = remaining[key]
            delete (remaining as Partial<T>)[key]
        }
    }

    return { extracted, remaining: remaining as Omit<T, K> }
}
