import { useReducer } from "react"

export const useForceRerender = () => {
    const [rerenderKey, rerender] = useReducer((key: number) => key + 1, 0)
    return { rerenderKey, rerender }
}
