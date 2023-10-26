import { CustomElement } from "../base.mjs";


/**
 * Element rendering an Obsidian Wikilink.
 */
export class WikilinkElement extends CustomElement {
    static get template() {
        return document.getElementById("template-hashtag")
    }

    /**
     * Get the path or name of the file this node points to.
     * @returns {string} The value in question.
     */
    get target() {
        return this.getAttribute("target")
    }

    /**
     * Get the text that should be displayed in this wikilink.
     * @returns {string} The text in question.
     */
    get text() {
        return this.getAttribute("text") ?? this.target
    }

    /**
     * The element displaying the wikilink.
     * Can be recreated with {@link recreateTagElement}.
     * @type {HTMLAnchorElement}
     */
    anchorElement

    /**
     * The name of the slot where {@link anchorElement} should be placed in.
     * @type {string}
     */
    static ANCHOR_ELEMENT_SLOT = "wikilink-anchor"

    /**
     * Recreate {@link anchorElement} with the current value of {@link target} and {@link text}.
     * @returns {void}
     */
    recreateTagElement() {
        if(this.anchorElement) {
            this.anchorElement.remove()
            this.anchorElement = null
        }

        this.anchorElement = document.createElement("a")
        this.anchorElement.slot = this.constructor.ANCHOR_ELEMENT_SLOT
        this.anchorElement.href = "#"  // TODO: Add href behaviour to the anchor.
        this.anchorElement.innerText = this.text
        this.appendChild(this.anchorElement)
    }

    onConnect() {
        super.onConnect()
        this.recreateTagElement()
    }
}
