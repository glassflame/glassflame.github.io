import {nameFromFileURL, getVaultFile} from "./fetch.mjs";


export class CardElement extends HTMLElement {
    /**
     * A reference to the element itself.
     *
     * @type {HTMLElement}
     */
    self

    constructor() {
        // noinspection UnnecessaryLocalVariableJS
        const self = super()
        this.self = self
    }

    /**
     * Get the {@link URL} this card is available at via the `href` attribute.
     *
     * @returns {URL} The URL in question.
     */
    href() {
        return new URL(this.self.getAttribute("href"))
    }

    /**
     * Get the human-readable name of this card via the `href` attribute.
     *
     * @returns {string} The name in question.
     */
    name() {
        return nameFromFileURL(this.href())
    }

    /**
     * Get the card's {@link VaultFile} via the `href` attribute.
     */
    async file() {
        // noinspection ES6RedundantAwait
        return await getVaultFile(this.href())
    }

    // noinspection JSUnusedGlobalSymbols
    connectedCallback() {
        const templateElement = document.getElementById("template-card")
        const instanceElement = templateElement.content.cloneNode(true)

        const nameElement = document.createElement("span")
        nameElement.setAttribute("slot", "card-name")
        nameElement.innerText = this.name()

        this.self.appendChild(nameElement)

        const shadow = this.attachShadow({ mode: "open" })
        shadow.appendChild(instanceElement)
    }
}
