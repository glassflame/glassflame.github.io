/**
 * Get configuration from the given location.
 *
 * @param location {Location} The location to use to determine the configuration.
 * @returns {{file: string, vault: string}}
 */
export function configFromURL(location) {
    const queryString = new URLSearchParams(location.search)
    const vault = queryString.get("vault")
    const file = queryString.get("file")

    return {vault, file}
}

/**
 * Get configuration from the current {@link window.location}.
 *
 * @returns {{file: string, vault: string}}
 */
export function configFromWindow() {
    return configFromURL(window.location)
}
