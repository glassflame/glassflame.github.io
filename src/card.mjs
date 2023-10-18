import {nameFromFileURL, getVaultFile} from "./fetch.mjs";
import {parsePageContents} from "./page.mjs";


export class CardElement extends HTMLElement {
    /**
     * The element containing the card's name.
     */
    nameElement

    /**
     * The element containing the card's contents.
     */
    contentsElement

    /**
     * Get the {@link URL} this card is available at via the `href` attribute.
     *
     * @returns {URL} The URL in question.
     */
    getCardHref() {
        return new URL(this.getAttribute("href"))
    }

    /**
     * Get the human-readable name of this card via the `href` attribute.
     *
     * @returns {string} The name in question.
     */
    getCardName() {
        return nameFromFileURL(this.getCardHref())
    }

    // noinspection JSUnusedGlobalSymbols
    connectedCallback() {
        const templateElement = document.getElementById("template-card")
        const instanceElement = templateElement.content.cloneNode(true)

        this.nameElement = document.createElement("span")
        this.nameElement.setAttribute("slot", "card-name")
        this.nameElement.innerText = this.getCardName()

        this.contentsElement = document.createElement("div")
        this.contentsElement.setAttribute("slot", "card-contents")

        this.appendChild(this.nameElement)
        this.appendChild(this.contentsElement)

        const shadow = this.attachShadow({ mode: "open" })
        shadow.appendChild(instanceElement)

        this.loadContents()
    }

    /**
     * Get the card's {@link VaultFile} via the `href` attribute.
     *
     * @returns {Promise<VaultFile>} The VaultFile.
     */
    async getCardVaultFile() {
        // noinspection ES6RedundantAwait
        return await getVaultFile(this.getCardHref())
    }

    /**
     * Get the card's contents rendered in HTML.
     *
     * @returns {Promise<String>} The unsanitized HTML.
     */
    async getCardContents() {
        const file = await this.getCardVaultFile()
        switch(file.kind) {
            case "page":
                const parsed = parsePageContents(file.contents)
                return parsed
            case "canvas":
                // TODO
                return "TODO"
            default:
                return ""
        }
    }

    /**
     * Load the card's contents.
     *
     * @returns {Promise<void>} Nothing.
     */
    async loadContents() {
        const contents = await this.getCardContents()
        this.contentsElement.innerHTML = contents
    }
}
