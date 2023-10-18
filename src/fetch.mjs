/**
 * No valid kind was determined during the execution of {@link kindFromExtension}.
 */
export class UnknownFileKindError extends Error {}


/**
 * Try to determine the {@link VaultFile.kind} from a file's extension.
 *
 * @param extension {string} The file's extension, with no leading colon.
 * @returns {"page"|"canvas"} The successfully determined file type.
 */
function kindFromExtension(extension) {
    if(extension === "md") return "page"
    else if(extension === ".canvas") return "canvas"
    throw UnknownFileKindError("No file type matched the given file extension.")
}

/**
 * A file contained in an Obsidian Vault.
 */
export class VaultFile {
    /**
     * The type of file.
     *
     * @type {"page"|"canvas"}
     */
    kind

    /**
     * The contents of the file.
     *
     * To be interpreted differently depending on the {@link kind} of the object.
     *
     * @type {any}
     */
    contents

    constructor({ kind, contents }) {
        this.kind = kind
        this.contents = contents
    }
}


/**
 * An error which occoured during a {@link fetch} request.
 */
export class VaultFetchError extends Error {
    /**
     * The {@link Response} object of the failed request.
     */
    response

    constructor(response, message) {
        super(message);
    }
}


/**
 * Get the name of a file from its {@link URL}.
 *
 * @param fileURL {URL} The URL to read.
 * @returns {string} The name of the file.
 */
export function nameFromFileURL(fileURL) {
    return decodeURIComponent(fileURL.pathname.split("/").at(-1).split(".").slice(0, -1).join("."))
}

/**
 * Fetch a {@link VaultFile} from the given {@link URL}.
 *
 * @param fileURL {URL} The URL where the file is accessible at.
 * @returns {VaultFile} The fetched {@link VaultFile}.
 */
async function fetchVaultFile(fileURL) {
    const response = await fetch(fileURL, {})

    if(!response.ok) throw new VaultFetchError(response, "Fetch response is not ok")

    const contents = await response.text()
    const kind = kindFromExtension(fileURL.pathname.split(".").at(-1))

    return new VaultFile({kind, contents})
}

/**
 * A cache mapping file URLs to {@link VaultFile}s.
 *
 * @type {{[fileURL: URL]: VaultFile}}
 */
const VAULT_CACHE = {}

/**
 * Try to get a {@link VaultFile} from the {@link VAULT_CACHE}, then, if it isn't available, {@link fetchVaultFile} it.
 *
 * @param fileURL {URL} The URL where the file should be accessible at.
 * @returns {VaultFile} The fetched {@link VaultFile}
 */
export async function getVaultFile(fileURL) {
    const cached = VAULT_CACHE[fileURL]

    if(cached !== undefined) return cached

    const vaultFile = await fetchVaultFile(fileURL)
    VAULT_CACHE[fileURL] = vaultFile
    return vaultFile
}
