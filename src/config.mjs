export function configFromURL(location) {
    const queryString = new URLSearchParams(location.search)
    const vref = queryString.get("vref")
    const wref = queryString.get("wref")

    return {vref, wref}
}

export function configFromWindow() {
    return configFromURL(window.location)
}
