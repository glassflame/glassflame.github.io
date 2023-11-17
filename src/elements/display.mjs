import { VaultElement } from "./vault.mjs";
import { findFirstAncestor } from "../utils/traversal.mjs";
import { fileDetails } from "../utils/file.mjs";
import { CustomElement } from "./base.mjs";


/**
 * Element loading and displaying the contents of a remote file.
 */
export class DisplayElement extends CustomElement {
    static get template() {
        return document.getElementById("template-display")
    }

    /**
     * The vault this element is displaying content from.
     * Can be recalculated via {@link recalculateVault}.
     * @type {VaultElement}
     */
    vault

    /**
     * Recalculate the value of {@link vault}.
     */
    recalculateVault() {
        this.vault = findFirstAncestor(this, VaultElement)
    }

    /**
     * Get the path or name of the file this node points to.
     * @returns {string} The value in question.
     */
    get path() {
        return this.getAttribute("path")
    }
    set path(value) {
        return this.setAttribute("path", value)
    }

    /**
     * An element displaying the loading status of the current element.
     * @type {HTMLDivElement|null}
     */
    loadingElement = null

    /**
     * An element displaying the contents of the current element.
     * @type {HTMLDivElement|null}
     */
    contentsElement = null

    /**
     * Slot shared by both {@link loadingElement} and {@link contentsElement}.
     * @type {string}
     */
    static CONTAINER_ELEMENT_SLOT = "display-container"

    /**
     * Recreate {@link loadingElement}, removing {@link contentsElement} if it exists.
     */
    recreateLoadingElement() {
        if(this.loadingElement !== null) {
            this.loadingElement.remove()
            this.loadingElement = null
        }
        if(this.contentsElement !== null) {
            this.contentsElement.remove()
            this.contentsElement = null
        }

        this.loadingElement = document.createElement("div")
        this.loadingElement.slot = this.constructor.CONTAINER_ELEMENT_SLOT
        this.loadingElement.innerText = "Loading..."
        this.appendChild(this.loadingElement)
    }

    /**
     * Recreate {@link contentsElement}, removing {@link loadingElement} if it exists.
     */
    recreateContentsElement() {
        if(this.loadingElement !== null) {
            this.loadingElement.remove()
            this.loadingElement = null
        }
        if(this.contentsElement !== null) {
            this.contentsElement.remove()
            this.contentsElement = null
        }

        const {extension} = fileDetails(this.path)

        switch(extension) {
            case "md":
                this.contentsElement = document.createElement("x-markdown")
                break
            case "canvas":
                this.contentsElement = document.createElement("x-canvas")
                break
            default:
                console.warn("Encountered a file with an unknown extension:", extension)
                return
        }

        this.contentsElement.setAttribute("document", this.document)
        this.contentsElement.slot = this.constructor.CONTAINER_ELEMENT_SLOT
        this.appendChild(this.contentsElement)
    }

    /**
     * The plaintext contents of the {@link path} document.
     * @type {string}
     */
    document

    /**
     * Reload the {@link path} {@link document}.
     * @returns {Promise<void>}
     */
    async reloadDocument() {
        const response = await this.vault.fetchCooldown(this.path)
        // TODO: Add a check that the request was successful
        this.document = await response.text()
    }

    async onConnect() {
        super.onConnect()
        this.recalculateVault()
        this.recreateLoadingElement()
        await this.reloadDocument()
        this.recreateContentsElement()
    }
}