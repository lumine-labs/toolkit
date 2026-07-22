type MaskStringOptions = {
    visible?: number
    char?: string
}

// Masks all but the last `visible` characters; values at or under `visible`
// characters come back fully masked at constant length, hiding their true size.
export const maskString = (value: string, { visible = 4, char = "*" }: MaskStringOptions = {}) => {
    if (!value) return ""
    if (value.length <= visible) return char.repeat(visible)
    return `${char.repeat(value.length - visible)}${value.slice(-visible)}`
}
