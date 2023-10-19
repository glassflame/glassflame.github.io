export class WikilinkElement extends HTMLElement {
    /**
     * Get the card this Wikilink points to via the `wref` attribute.
     *
     * @returns {String} The card target.
     */
    getWikilinkWref() {
        return this.getAttribute("wref")
    }

    /**
     * The clickable anchor resolving the Wikilink.
     */
    anchorElement

    connectedCallback() {
        const templateElement = document.getElementById("template-wikilink")
        const instanceElement = templateElement.content.cloneNode(true)

        this.anchorElement = this.querySelector(".wikilink")

        this.title = this.getWikilinkWref()



        const shadow = this.attachShadow({ mode: "open" })
        shadow.appendChild(instanceElement)
    }
}