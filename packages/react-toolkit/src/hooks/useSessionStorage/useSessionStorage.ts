import { createStorageHook } from "../../factories/createStorageHook/index.js"

export const useSessionStorage = createStorageHook(() => window.sessionStorage)
