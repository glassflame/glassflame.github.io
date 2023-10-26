import { CustomElement } from "../base.mjs";


/**
 * Element rendering an Obsidian Hashtag.
 */
export class HashtagElement extends CustomElement {
    static get template() {
        return document.getElementById("template-hashtag")
    }

    /**
     * The name of the hashtag, with no leading hash, obtained from the `tag` attribute.
     * @returns {string}
     */
    get tag() {
        return this.getAttribute("tag")
    }

    /**
     * The element displaying the hashtag.
     * Can be recreated with {@link recreateTagElement}.
     * @type {HTMLSpanElement}
     */
    tagElement

    /**
     * The name of the slot where {@link tagElement} should be placed in.
     * @type {string}
     */
    static TAG_ELEMENT_SLOT = "hashtag-tag"

    /**
     * Recreate {@link tagElement} with the current value of {@link tag}.
     */
    recreateTagElement() {
        if(this.tagElement) {
            this.tagElement.remove()
            this.tagElement = null
        }

        this.tagElement = document.createElement("span")
        this.tagElement.slot = this.constructor.TAG_ELEMENT_SLOT
        this.tagElement.innerText = `#${this.tag}`
        this.appendChild(this.tagElement)
    }

    onConnect() {
        super.onConnect()
        this.recreateTagElement()
    }
}
