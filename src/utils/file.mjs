/**
 * Parse a file path to get the file name and extension.
 *
 * @param file The file path to parse.
 * @returns {[String, String]} The file's name and extension without the dot respectively.
 */
export function fileDetails(file) {
    const split = file.split("/").at(-1).split(".")
    const name = split.slice(0, -1)
    const extension = split.at(-1)
    return [name, extension]
}
