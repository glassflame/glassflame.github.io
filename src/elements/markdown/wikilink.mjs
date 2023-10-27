import { CustomElement } from "../base.mjs";


/**
 * Element rendering an Obsidian Wikilink.
 */
export class WikilinkElement extends CustomElement {
    static get template() {
        return document.getElementById("template-wikilink")
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
        // TODO: Dirty hack to hide "undefined"
        const text = this.getAttribute("text")
        // noinspection EqualityComparisonWithCoercionJS
        if(text == "undefined") {
            return this.target
        }
        return text
    }

    /**
     * The CSS selector of the anchor element.
     * @type {string}
     */
    static ANCHOR_SELECTOR = "a.wikilink"

    /**
     * The element displaying the wikilink.
     * Can be recreated with {@link recreateTagElement}.
     * @type {HTMLAnchorElement}
     */
    anchorElement

    /**
     Update the value of the {@link canvasItemElement} by querying the current {@link instance} with {@link ANCHOR_SELECTOR}.
     * @returns {void}
     */
    recalculateAnchorElement() {
        this.anchorElement = this.instance.querySelector(this.constructor.ANCHOR_SELECTOR)
    }

    resetAnchorElementProperties() {
        this.anchorElement.href = this.target
        this.anchorElement.innerText = this.text
    }

    onConnect() {
        super.onConnect()
        this.recalculateAnchorElement()
        this.resetAnchorElementProperties()
    }
}
