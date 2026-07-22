import { isValidElement, type ReactNode } from "react"

export function castNodeToBoolean(node: ReactNode): boolean {
    if (node === null || node === undefined || node === false) return false
    if (typeof node === "string") return node.trim().length > 0
    if (typeof node === "number") return true // Numbers (including 0) are valid
    if (isValidElement(node)) return true
    if (Array.isArray(node)) return node.some(castNodeToBoolean)
    return false
}
