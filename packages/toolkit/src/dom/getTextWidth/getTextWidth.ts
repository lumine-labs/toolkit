let context: CanvasRenderingContext2D | null = null

// Measures rendered text width via a single shared offscreen canvas.
export const getTextWidth = (text: string, font: string) => {
    context ??= document.createElement("canvas").getContext("2d")
    if (!context) return 0

    context.font = font
    return context.measureText(text).width
}
