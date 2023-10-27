/**
 * The body element for the pages viewer, handling most low-level things.
 */
export class BrowseElement extends HTMLBodyElement {
    /**
     * Parameters to be used to display *things*.
     * @type {{vault: string, path: string, highlight: string}}
     */
    parameters

    /**
     * Recalculate the value of {@link parameters} using the current {@link window.location}.
     * @returns {void}
     */
    recalculateParameters() {
        const location = window.location
        const params = new URLSearchParams(location.search)
        const vault = params.get("vault")
        const path = params.get("path")
        const highlight = location.hash.replace(/^#/, "")
        this.parameters = {vault, path, highlight}
    }

    urlFor({vault = this.parameters.vault, path = this.parameters.path, highlight = this.parameters.highlight}) {
        const location = window.location
        const params = new URLSearchParams(location.search)
        params.set("vault", vault)
        params.set("path", path)
        const url = new URL(location)
        url.search = params.toString()
        url.hash = highlight
        return url
    }

    // TODO: Add a landing page

    /**
     * The vault element, describing to its descendants how to handle various situations.
     * @type {VaultElement}
     */
    vaultElement

    /**
     * The display element showing the contents of the specified file.
     * @type {DisplayElement}
     */
    rootDisplayElement

    /**
     * Recreate all contents of this element to match the current value of {@link parameters}.
     */
    recreateContents() {
        if(this.vaultElement) {
            this.vaultElement.remove()
            this.vaultElement = null
            this.rootDisplayElement = null
        }

        this.vaultElement = document.createElement("x-vault")
        this.vaultElement.base = this.parameters.vault
        this.vaultElement.cooldownMs = 0

        this.rootDisplayElement = document.createElement("x-display")
        this.rootDisplayElement.path = this.parameters.path
        this.rootDisplayElement.slot = "vault-child"

        this.vaultElement.appendChild(this.rootDisplayElement)
        this.appendChild(this.vaultElement)
    }

    connectedCallback() {
        this.recalculateParameters()
        this.recreateContents()
    }
}