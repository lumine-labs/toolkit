import { createFileList } from "../packages/toolkit/src/index.js"

// jsdom does not implement the DataTransfer constructor — stub the minimal
// surface createFileList relies on (items.add collecting into a files list).
class MockDataTransfer {
    private readonly collected: File[] = []

    items = {
        add: (file: File) => {
            this.collected.push(file)
        },
    }

    get files() {
        return Object.assign([...this.collected], {
            item: (index: number) => this.collected[index] ?? null,
        }) as unknown as FileList
    }
}

beforeEach(() => {
    vi.stubGlobal("DataTransfer", MockDataTransfer)
})

afterEach(() => {
    vi.unstubAllGlobals()
})

describe("createFileList", () => {
    it("builds a FileList with the given files in order", () => {
        const first = new File(["a"], "a.txt", { type: "text/plain" })
        const second = new File(["b"], "b.txt", { type: "text/plain" })

        const fileList = createFileList([first, second])
        expect(fileList.length).toBe(2)
        expect(fileList.item(0)?.name).toBe("a.txt")
        expect(fileList.item(1)?.name).toBe("b.txt")
    })

    it("returns an empty FileList for an empty array", () => {
        expect(createFileList([]).length).toBe(0)
    })
})
