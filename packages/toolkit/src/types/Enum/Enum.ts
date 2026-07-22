export type EnumLike = Record<string, string | number>

export type Enum<T extends EnumLike> = T[keyof T]

export const Enum = Object.assign(<const T extends EnumLike>(e: T) => e, {
    keys: <T extends EnumLike>(e: T) => Object.keys(e) as (keyof T)[],
    values: <T extends EnumLike>(e: T) => Object.values(e) as Enum<T>[],
    entries: <T extends EnumLike>(e: T) => Object.entries(e) as [keyof T, Enum<T>][],
    keyOf: <T extends EnumLike>(e: T, value: Enum<T>) =>
        Object.keys(e).find((k) => e[k] === value) as keyof T | undefined,
})
