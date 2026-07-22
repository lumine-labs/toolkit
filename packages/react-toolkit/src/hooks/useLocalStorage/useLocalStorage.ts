import { createStorageHook } from "../../factories/createStorageHook/index.js"

export const useLocalStorage = createStorageHook(() => window.localStorage)
