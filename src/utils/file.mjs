export function filePath(file) {
    const stack = []

    for(const part of file.split("/")) {
        if(part === ".") {
            // noinspection UnnecessaryContinueJS
            continue
        }
        else if(part === "..") {
            stack.pop()
        }
        else {
            stack.push(part)
        }
    }

    return stack
}

export function fileDetails(file) {
    const path = filePath(file)
    const directory = path.slice(0, -1).join("/")
    const nameExtension = path.at(-1)

    const split2 = nameExtension.split(".")
    const name = split2.slice(0, -1)
    const extension = split2.at(-1)

    return {path, directory, name, extension}
}
