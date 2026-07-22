// Builds a native FileList from plain Files — the only way to programmatically
// populate an <input type="file">.files (the DataTransfer trick).
export const createFileList = (files: File[]) => {
    const dataTransfer = new DataTransfer()
    files.forEach((file) => dataTransfer.items.add(file))
    return dataTransfer.files
}
