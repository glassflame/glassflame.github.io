import {fileDetails, filePath} from "../utils/file.mjs";

/**
 * The body element for the pages viewer, handling most low-level things.
 */
export class BrowseElement extends HTMLBodyElement {
    /**
     * @returns {string|null} The base URL of the current vault.
     */
    get vault() {
        return new URLSearchParams(window.location.search).get("vault")
    }
    set vault(value) {
        window.location.replace(this.urlFor({vault: value}))
    }

    /**
     * @returns {string} The path of the current displayed file.
     */
    get path() {
        return new URLSearchParams(window.location.search).get("path") || "README.md"
    }
    set path(value) {
        window.location.replace(this.urlFor({path: value}))
    }

    /**
     * Determine the URL to reach a certain page, using the current {@link vault} and {@link path} as default, and overwriting them with the function's arguments.
     * @param vault The base URL of the vault to use.
     * @param path The file path of the file to display.
     * @returns {URL} The resulting URL.
     */
    urlFor({vault = this.vault, path = this.path}) {
        const location = window.location
        const params = new URLSearchParams(location.search)
        params.set("vault", vault)
        params.set("path", path)
        const url = new URL(location)
        url.search = params.toString()
        return url
    }

    /**
     * The landing page element, telling the user how to view a vault.
     * Can be recreated by {@link recreateLandingElement}.
     * Mutually exclusive with {@link vaultElement}.
     * @type {LandingElement|null}
     */
    landingElement

    recreateLandingElement() {
        if(this.landingElement) {
            this.landingElement.remove()
            this.landingElement = null
        }
        if(this.vaultElement) {
            this.vaultElement.remove()
            this.vaultElement = null
        }
        if(this.rootDisplayElement) {
            this.rootDisplayElement.remove()
            this.rootDisplayElement = null
        }

        this.vaultElement = document.createElement("x-landing")

        this.appendChild(this.vaultElement)
    }

    /**
     * The vault element, describing to its descendants how to handle various situations.
     * Can be recreated by {@link recreateVaultElement}.
     * Mutually exclusive with {@link landingElement}.
     * @type {VaultElement|null}
     */
    vaultElement

    /**
     * Recreate {@link vaultElement} with the current value of {@link vault}.
     * @returns {void}
     */
    recreateVaultElement() {
        if(this.landingElement) {
            this.landingElement.remove()
            this.landingElement = null
        }
        if(this.vaultElement) {
            this.vaultElement.remove()
            this.vaultElement = null
        }
        if(this.rootDisplayElement) {
            this.rootDisplayElement.remove()
            this.rootDisplayElement = null
        }

        this.vaultElement = document.createElement("x-vault")
        this.vaultElement.base = this.vault
        this.vaultElement.cooldownMs = 0

        this.appendChild(this.vaultElement)
    }

    /**
     * The title of the page.
     * Can be recreated by {@link recreateTitleElement}.
     * @type {HTMLHeadingElement}
     */
    titleElement

    /**
     * The name of this application, displayed if no page is being shown.
     * @type {string}
     */
    static APP_NAME = "Glassflame"

    /**
     * Recreate {@link titleElement} with the current value of {@link path}.
     * @returns {void}
     */
    recreateTitleElement() {
        if(this.titleElement) {
            this.titleElement.remove()
            this.titleElement = null
        }

        const vault = this.vault

        let name
        if(vault === null) {
            name = this.constructor.APP_NAME
        }
        else {
            name = fileDetails(this.path).name
        }

        this.titleElement = document.createElement("h1")
        this.titleElement.innerText = name

        this.appendChild(this.titleElement)
    }

    /**
     * The display element showing the contents of the specified file.
     * Can be recreated by {@link recreateRootDisplayElement}.
     * Mutually exclusive with {@link landingElement}.
     * @type {DisplayElement|null}
     */
    rootDisplayElement

    /**
     * Recreate {@link rootDisplayElement} with the current value of {@link path}.
     * @returns {void}
     */
    recreateRootDisplayElement() {
        if(this.rootDisplayElement) {
            this.rootDisplayElement.remove()
            this.rootDisplayElement = null
        }

        this.rootDisplayElement = document.createElement("x-display")
        this.rootDisplayElement.path = this.path
        this.rootDisplayElement.slot = "vault-child"

        this.vaultElement.appendChild(this.rootDisplayElement)
    }

    // noinspection JSUnusedGlobalSymbols
    connectedCallback() {
        this.recreateTitleElement()
        if(this.vault === null) {
            this.recreateLandingElement()
        }
        else {
            this.recreateVaultElement()
            this.recreateRootDisplayElement()
        }
    }
}